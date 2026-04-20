let inquiryRegistrationCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query } = require("express");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const registerNewUserModel = new (require("../../../common/model/akahu-details/registerNewUserModel"))();
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

inquiryRegistrationCtrl.create = async (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        data.email = data.email.trim().toLocaleLowerCase();
        // create code here
        registerNewUserModel.findByAttribute({ email: data.email }, (err, getData) => {
            if (err) {
                let errMessage = { code: 1010, message: "Fail....." };;
                errMessage.message = err.message
                response.setError(errMessage);
                response.send(res)
            }
            else if (_.isEmpty(getData)) {
                registerNewUserModel.create(data, (err, Create) => {
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
                response.setData(AppCode.AlreadyExist);
                response.send(res);
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "inquiry-registration" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

inquiryRegistrationCtrl.allList = async (req, res) => {
    const response = new HttpRespose();
    try {
        registerNewUserModel.get((err, allListData) => {
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
        errorLogModel.create({ errorMessage: exception.message, tableName: "inquiry-registraion" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

inquiryRegistrationCtrl.sendEmail = async (req, res) => {
    const response = new HttpRespose();
    try {

        let selectedIdWiseEmail = [];

        req.body.inquiryIds.map(async x => {
            let email = await registerNewUserModel.findOne({ id: x }, (err, data) => { return data.email });
            selectedIdWiseEmail.push(email);
        })

        let mailObj = {
            host: CONFIG.MAIL.HOST,
            port: CONFIG.MAIL.PORT,
            secure: CONFIG.MAIL.SECURE,
            auth: {
                user: CONFIG.MAIL.MAILID,
                pass: CONFIG.MAIL.PASSWORD
            }
        }

        var transporter = nodemailer.createTransport(mailObj);
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };

        readHTMLFile('../common/HtmlTemplate/forgot-password.html', function (err, html) {
            var template = handlebars.compile(html);

            selectedIdWiseEmail.map((x, index) => {

                var mailOptions = {
                    from: CONFIG.MAIL.MAILID,
                    to: x,
                    subject: 'App Lunched',
                    html: template,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("error", error)
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                if (index + 1 == selectedIdWiseEmail.length) {
                    response.setData(AppCode.Success);
                    response.send(res);
                }

            })

        });

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "inquiry-registraion" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

module.exports = inquiryRegistrationCtrl;