"use strict";
const AWS = require('aws-sdk')

let dynamoDbConnect = {};

dynamoDbConnect.init = function () {
    return new Promise((resolve, reject) => {

        AWS.config.update({
            region: "eu-north-1",
            maxRetries: 3,
            httpOptions: { timeout: 30000, connectTimeout: 5000 },
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
        const db = new AWS.DynamoDB.DocumentClient();
        console.log('DynamoDB Document Client created:', db);
        global.dynamoDbCon = db;
        console.log("database connected.");
        resolve();
        // .then(() => {
        // }).catch(err => {
        //     console.log(err);
        //     reject(err);
        // });
    });
};
dynamoDbConnect.getConn = function () {
    return global.dynamoDbCon;
}
module.exports = dynamoDbConnect;