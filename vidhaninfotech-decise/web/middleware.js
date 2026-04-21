const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
var expressSession = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
const CONFIG = require("./../config");
const fs = require('fs');
const multer = require("multer");
const multerS3 = require("multer-s3");
const { expressjwt } = require("express-jwt");
const blacklist = require("express-jwt-blacklist");
const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: CONFIG.AWS.REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Note: multer-s3 v3 removed per-upload ACL support.
// To make uploaded files publicly accessible, configure a bucket policy
// on your S3 bucket (e.g., allow s3:GetObject for Principal: "*").
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: CONFIG.AWS.S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
  })
});

module.exports = (app) => {
  app.use(compression());
  app.use(cors());

  blacklist.configure({
    tokenId: "jti",
  });

  // express-jwt v8: named export, requires 'algorithms', uses requestProperty
  CONFIG.JWTTOKENALLOWACCESS = expressjwt({
    secret: CONFIG.JWTTOKENKEY,
    algorithms: ["HS256"],
    requestProperty: "payload",
    isRevoked: (req, token) =>
      new Promise((resolve, reject) =>
        blacklist.isRevoked(req, token.payload, (err, revoked) => {
          if (err) reject(err);
          else resolve(revoked);
        })
      ),
  });

  app.use(bodyParser.json({ limit: "16gb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "16gb",
      extended: true,
    })
  );
  app.use(cookieParser());
  app.use(
    expressSession({
      secret: CONFIG.COOKIE_PRIVATE_KEY,
      name: "desice-node",
      proxy: true,
      resave: true,
      saveUninitialized: true,
      httponly: true,
    })
  );
  app.use(express.static("public"));
  app.use(logger("dev"));
  app.use("/v1/auth/modify-business-details", function (req, res, next) {
    next();
  });

  app.use("/", express.static(path.join(__dirname, CONFIG.APP.WEB.PUB_DIR)));
  app.use('/uploads', express.static(path.join(__dirname, '/../uploads')))
  app.use(
    "/images",
    express.static(path.resolve("/../frontend/dist/decise_development/assets/images/default"))
  );
  app.use("/assets", express.static(path.resolve("/../frontend/dist/decise_development/assets")));

  var cpUpload = upload.fields([
    { name: "supportTicketFile", maxCount: 50 },
    { name: "icon", maxCount: 1 },
    { name: "splitPaymentPicture", maxCount: 5 },
    { name: "profile_picture", maxCount: 1 },
  ]);

  app.use("/v1/monitization", cpUpload, require("../web/routes/v1/monitization"));
  app.use("/v1/adminAuth", cpUpload, require("../web/routes/v1/adminAuth"));
  app.use("/v1/admin-account", cpUpload, require("../web/routes/v1/adminAccount"));
  app.use("/v1/support-ticket", cpUpload, require("../web/routes/v1/supportTicket"));
  app.use("/v1/token", cpUpload, require("../web/routes/v1/exchangeToken"));
  app.use("/v1/akahu", cpUpload, require("./routes/v1/akahuUser"));
  app.use("/v1/split-payment", cpUpload, require("./routes/v1/splitPayment"));
  app.use("/v1/webhook", cpUpload, require("./routes/v1/webhook"));
  app.use("/v1/notification", cpUpload, require("./routes/v1/notifications"));
  app.use("/v1/transaction", cpUpload, require("./routes/v1/transaction"));
  app.use("/v1/financialGoals", cpUpload, require("./routes/v1/financialGoals"));
  app.use("/v1/inquiry", cpUpload, require("./routes/v1/inquiryRegistration"));
  app.use("/v1/newLetterSubscription", cpUpload, require("./routes/v1/newsLetterSubscription"));
  app.use("/v1/autoPaymentCreate", cpUpload, require("./routes/v1/autoPaymentCreate"));

  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    if (err.name === "UnauthorizedError") {
      if (err.message === "jwt expired") {
        res.status(401);
        res.json({
          meta: { code: 402, message: err.name + ": " + err.message },
        });
      } else {
        res.status(401);
        res.json({
          meta: { code: 401, message: err.name + ": " + err.message },
        });
      }
    } else {
      res.status(err.status || 500).send({
        error: err.message ? err.message : "Something failed!",
      });
    }
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/dist/decise_development/index.html'));
  });

  return app;
};
