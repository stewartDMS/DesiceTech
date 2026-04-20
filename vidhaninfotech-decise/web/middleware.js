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
const expressjwt = require("express-jwt");
const blacklist = require("express-jwt-blacklist");


const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: "eu-north-1",
  accessKeyId: 'AKIA5J3ADIJ2N74DA775',
  secretAccessKey: "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"
});

const s3Bucket = s3.putObject


// file storage path set field wise 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dirPath = CONFIG.UPLOADS.DEFAULT;
    if (!!file.fieldname) {
      if (file.fieldname === "icon") {
        dirPath = CONFIG.UPLOADS.DIR_PATH_ICONS;
      }
      else if (file.fieldname === "supportTicketFile") {
        dirPath = CONFIG.UPLOADS.DIR_PATH_SUPPORT_TICKET;
      }
      else if (file.fieldname === "splitPaymentPicture") {
        dirPath = CONFIG.UPLOADS.DIR_PATH_SPLIT_PAYMENT_PICTURE;
      }
      else if (file.fieldname === "projectFiles" || file.fieldname === "images" || file.fieldname === "profile_picture") {
        dirPath = CONFIG.UPLOADS.DIR_PATH_IMAGES;
      }
      else if (file.fieldname === "videos") {
        dirPath = CONFIG.UPLOADS.DIR_PATH_VIDEOS;
      }
      else if (file.fieldname === "documents") {
        dirPath = CONFIG.UPLOADS.DIR_PATH_DOCUMENTS;
      }
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  // storage: storage,
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'desicefilesupload',
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

  CONFIG.JWTTOKENALLOWACCESS = expressjwt({
    secret: CONFIG.JWTTOKENKEY,
    userProperty: "payload",
    isRevoked: blacklist.isRevoked,
  });

  app.use(bodyParser.json({ limit: "16gb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "16gb",
      extended: true,
    })
  );
  app.use(cookieParser());
  /**
   *@description Express Session
   */
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

  // connect with react build file
  app.use("/", express.static(path.join(__dirname, CONFIG.APP.WEB.PUB_DIR)));

  app.use('/uploads', express.static(path.join(__dirname, '/../uploads')))
  app.use(
    "/images",
    express.static(path.resolve("/../frontend/dist/decise_development/assets/images/default"))
  );
  app.use("/assets", express.static(path.resolve("/../frontend/dist/decise_development/assets")));



  // any image or file or etc upload then add filed name on this below fileds
  var cpUpload = upload.fields([
    {
      name: "supportTicketFile",
      maxCount: 50,
    },
    {
      name: "icon",
      maxCount: 1,
    },
    {
      name: "splitPaymentPicture",
      maxCount: 5,
    },
    {
      name: "profile_picture",
      maxCount: 1,
    },
    // {
    //   name: "documents",
    //   maxCount: 15,
    // },
    // {
    //   name: "videos",
    //   maxCount: 15,
    // },
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
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    console.log("err", err);

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
      // render the error page
      res.status(err.status || 500).send({
        error: err.message ? err.message : "Something failed!",
      });
      // res.send("error", err);
    }
  });

  // reload issuse solve of this line
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/dist/decise_development/index.html'));
  });


  return app;
};
