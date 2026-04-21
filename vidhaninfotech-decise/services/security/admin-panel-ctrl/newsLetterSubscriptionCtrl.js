let newsLetterSubscriptionCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const newsLetterSubscriptionModel = new (require("../../../common/model/newsLetterSubscriptionModel"))();
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

newsLetterSubscriptionCtrl.create = async (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        data.email = data.email.trim().toLocaleLowerCase();
        // create code here
        newsLetterSubscriptionModel.findByAttribute({ email: data.email }, (err, getData) => {
            if (err) {
                let errMessage = { code: 1010, message: "Fail....." };;
                errMessage.message = err.message
                response.setError(errMessage);
                response.send(res)
            }
            else if (_.isEmpty(getData)) {
                newsLetterSubscriptionModel.create(data, (err, Create) => {
                    if (err) {
                        let errMessage = { code: 1010, message: "Fail....." };;
                        errMessage.message = err.message
                        response.setError(errMessage);
                        response.send(res)
                    } else {
                        response.setData(AppCode.Success, Create);
                        response.send(res);
                    }
                });
            }
            else {
                response.setData({ code: 1010, message: "Already Subscribed." });
                response.send(res);
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "new letter subscribe-registration" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

newsLetterSubscriptionCtrl.allList = async (req, res) => {
    const response = new HttpRespose();
    try {
        newsLetterSubscriptionModel.get((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {
                response.setData(AppCode.Success, allListData);
                response.send(res);
            }
        });

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "subscribe list" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

module.exports = newsLetterSubscriptionCtrl;