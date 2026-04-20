const http = require("http");
const https = require("https");
const express = require("express");
const app = express();
const crypto = require('crypto');
const dynamoDbConnect = require("../common/nosql/dynamoDb/index");
const CONFIG = require("../config");
const _ = require("lodash");
const fs = require('fs');
const swaggerUi = require("swagger-ui-express");
const swaggerDocumentForAdmin = require("./../swagger-admin.json");
const swaggerDocumentForMobile = require("./../swagger-mobile.json");
var router = express.Router();

let server;
if (CONFIG.NODE_ENV === "development") {
    console.log("Your server is running on developer mode...!");
}
else if (CONFIG.NODE_ENV === "production") {
    console.log("Your server is running on production mode...!");
}
else if (CONFIG.NODE_ENV === "staging") {
    console.log("Your server is running on staging mode...!");
}

var selfsigned = require('selfsigned');



require('dotenv').config();

// app.use("/swagger-admin", swaggerUi.serve, swaggerUi.setup(swaggerDocumentForAdmin));
// app.use("/swagger-mobile", swaggerUi.serve, swaggerUi.setup(swaggerDocumentForMobile));

var options = {}
app.use('/swagger-admin', swaggerUi.serveFiles(swaggerDocumentForAdmin, options), swaggerUi.setup(swaggerDocumentForAdmin));
app.use('/swagger-mobile', swaggerUi.serveFiles(swaggerDocumentForMobile, options), swaggerUi.setup(swaggerDocumentForMobile));



dynamoDbConnect.init()
    .then(() => {
        require("./middleware")(app);

        app.set("port", CONFIG.APP.WEB.PORT);
        // server = https.createServer(app);

        // var attrs = [{ name: 'commonName', value: 'contoso.com' }];
        // var pems = selfsigned.generate(attrs, { days: 365 });
        // console.log(pems)


        // const options = { key: pems.private, cert: pems.cert };
        // server = https.createServer(options, app);
        // const options = {
        //     hostname: 'desice.tech',
        // }
        // server = https.createServer(options, app);
        server = http.createServer(app);


        server.listen(CONFIG.APP.WEB.PORT, err => {
            console.log(
                `your project API is listening on port ${CONFIG.APP.WEB.PORT}`
            );
        });

        server.on("error", onError);
    })
    .catch(err => {
        console.log(err);
        console.log("Unable to connect to database");
    });

dynamoDbConnect.getConn();

const generateSelfSignedCertificate = () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    var cert = `-----BEGIN CERTIFICATE-----\n`;
    var publicKeyPem = publicKey.toString().trim().split('\n').slice(1, -1).join('');
    var certBody = Buffer.from(`3082012c3081f4a003020102020101300e06035504030c0754657374536f636b30819f300d06092a864886f70d01010b050003818d0030818902818100b2a29c4fd5b03c17a55ad1407984aa162f0f6a89b9f063cc2b2f6d783fae74783fd48e13d70bb4703e66cb6955b12c21aa76e1b0499a5043bb0ac001af7f11948aa28d7406a8e8d59f3ab4c1d21496366e689eb68c3be05b8df98fb7aa3bc4d3dc5e97d0f2a262ab29f5011208582d3e9da138883be8ff429a1d5c1d0203010001`, 'hex');
    cert += Buffer.concat([Buffer.from(publicKeyPem, 'base64'), certBody]).toString('base64');
    var certEnd = '\n-----END CERTIFICATE-----\n';
    return {
        key: privateKey,
        cert: cert + certEnd
    };
};

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function shutdownServer() {
    server.close(() => {
        process.exit(0);
    });
    setTimeout(() => {
        process.exit(0);
    }, 5000);
}
process.stdin.resume();
process
    .on("SIGINT", () => {
        shutdownServer();
    })
    .on("SIGTERM", () => {
        shutdownServer();
    })
    .on("SIGTSTP", () => {
        shutdownServer();
    })
    .on("SIGTSTOP", () => {
        shutdownServer();
    })
    .on("SIGHUP", () => {
        shutdownServer();
    })
    .on("SIGQUIT", () => {
        shutdownServer();
    })
    .on("SIGABRT", () => {
        shutdownServer();
    })
    .on("unhandledRejection", err => {
        console.log("Unhandled reject throws: ");
        console.log(err);
    })
    .on("uncaughtException", err => {
        console.log("Uncaught exception throws: ");
        console.log(err);
        process.exit(1);
    });