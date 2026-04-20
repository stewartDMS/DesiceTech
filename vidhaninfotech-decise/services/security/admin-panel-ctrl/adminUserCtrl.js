let adminUserCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query } = require("express");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const adminUserModel = new (require("../../../common/model/adminUserModel"))();
const verificationCodeModel = new (require("../../../common/model/verificationCodeModel"))();
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

adminUserCtrl.createAdminUser = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;

    try {
        data.email = data.email.toLowerCase();
        data.role = parseInt(data.role);

        adminUserModel.create(data, (err, createAdminUser) => {
            if (err) {
                console.log(err)
                response.setError(AppCode.Fail);
                response.send(res);
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

adminUserCtrl.updateAdminUser = (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        data.email = data.email.toLowerCase();
        data.role = parseInt(data.role);

        adminUserModel.update({ id: req.query.id }, data, function (err, update) {
            if (err) {
                console.log(err)
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

adminUserCtrl.getAdminUserByID = (req, res) => {
    var response = new HttpRespose()

    try {
        let query = {
            id: req.query.id
        }

        adminUserModel.findOne(query, (err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, getData);
                response.send(res);
            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

adminUserCtrl.getAllAdminUserList = (req, res) => {
    var response = new HttpRespose();
    try {
        let query = [
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    role: 1,
                    status: 1,
                }
            }
        ]
        adminUserModel.get((err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, getData);
                response.send(res);
            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

adminUserCtrl.login = (req, res) => {
    const response = new HttpRespose();
    try {
        adminUserModel.findOneByEmail(req.body.email.trim().toLowerCase(), (err, adminUserData) => {
            if (err) {
                Logger.error(AppCode.InternalServerError.message, err);
                response.setError(AppCode.InternalServerError);
                response.send(res);

            }
            else if (_.isEmpty(adminUserData)) {
                response.setError(AppCode.EmailNotValid);
                response.send(res);
            }
            else {
                if (adminUserData === null) {
                    response.setError(AppCode.EmailNotValid);
                    response.send(res);
                } else {
                    if (adminUserData.status == 2) {
                        if (err) {
                            response.setError(err);
                            response.send(res);
                        } else {
                            response.setData(AppCode.UserNotActivated);
                            response.send(res);
                        }
                    } else {
                        bcrypt.compare(req.body.password, adminUserData.password, function (err, pwdResult) {
                            if (pwdResult) {
                                adminUserModel.generateSessionToken({ id: adminUserData.id }, function (err, userResData) {
                                    if (err) {
                                        response.setError(err);
                                        response.send(res);
                                    } else {
                                        res.cookie(
                                            "whatsyourfunction-token",
                                            userResData.myToken,
                                            {
                                                maxAge: CONFIG.JWTTIMEOUT,
                                                httpOnly: false,
                                            }
                                        );
                                        response.setData(AppCode.LoginSuccess, userResData);
                                        response.send(res);
                                    }
                                }
                                );
                            } else {
                                response.setError(AppCode.InvalidCredential);
                                response.send(res);
                            }
                        });
                    }
                }
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

adminUserCtrl.sendOTP = (req, res) => {
    const response = new HttpRespose();
    try {
        adminUserModel.findOneByEmail(req.body.email.trim().toLowerCase(), (err, adminUserData) => {
            if (err) {
                response.setError(AppCode.InternalServerError);
                response.send(res);
            } else if (_.isEmpty(adminUserData)) {
                response.setError(AppCode.EmailNotValid);
                response.send(res);
            } else {
                if (adminUserData === null) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                } else {
                    verificationCodeModel.deleteMany({ adminUserId: adminUserData.id }, function (err, removecode) {
                        if (err) {
                            AppCode.Fail.error = err.message;
                            response.setError(AppCode.Fail);
                            response.send(res);;
                        }
                        else {
                            let params = {
                                adminUserId: adminUserData.id,
                            };
                            verificationCodeModel.create(params, (err, code) => {
                                if (err) {
                                    response.setError(AppCode.InternalServerError);
                                    response.send(res);
                                } else {
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

                                        var replacements = {
                                            otp: code.token,
                                        };

                                        var htmlToSend = template(replacements);

                                        var mailOptions = {
                                            from: CONFIG.MAIL.MAILID,
                                            to: adminUserData.email,
                                            subject: 'Forgot Password For OTP',
                                            html: htmlToSend,
                                        };
                                        transporter.sendMail(mailOptions, function (error, info) {
                                            if (error) {
                                                console.log("error", error)
                                            } else {
                                                console.log('Email sent: ' + info.response);
                                                response.setData(AppCode.Success, adminUserData.id);
                                                response.send(res);
                                            }

                                        });
                                    });
                                }
                            })

                        }
                    })

                }
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

adminUserCtrl.verifyOTP = (req, res) => {
    const response = new HttpRespose();

    try {
        let id = req.body.id;
        verificationCodeModel.findByAttribute({ adminUserId: id }, (err, verifyOTP) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else {

                if (!!verifyOTP) {
                    let expireDate = new Date(verifyOTP.expiredAt);
                    let currentDate = new Date();

                    if (expireDate >= currentDate && verifyOTP.status == 1) {
                        if (verifyOTP.token == req.body.otp.toString()) {
                            verificationCodeModel.updateData({ id: verifyOTP.id }, { status: 2 }, function (err, update) {
                                if (err) {
                                    console.log(err)
                                    response.setError(AppCode.Fail);
                                    response.send(res);
                                } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                                    response.setError(AppCode.NotFound);
                                    response.send(res);
                                } else {
                                    response.setData(AppCode.OTPVerified, id);
                                    response.send(res);
                                }
                            })

                        }
                        else {
                            response.setError(AppCode.ValidOTP);
                            response.send(res);
                        }
                    }
                    else {
                        response.setError(AppCode.OTPExpire);
                        response.send(res);
                    }
                }
                else {
                    response.setError(AppCode.OTPExpire);
                    response.send(res);
                }
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

adminUserCtrl.passwordUpdate = (req, res) => {
    const response = new HttpRespose();

    try {
        var bodyData = req.body;
        adminUserModel.findOne({ id: bodyData.id }, (err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                // update code

                verificationCodeModel.findByAttribute({ adminUserId: bodyData.id }, (err, verifyOTP) => {
                    if (err) {
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else {

                        if (verifyOTP && verifyOTP.status == 2) {
                            let data = {
                                password: bodyData.password
                            }

                            adminUserModel.updateForgotPassword({ id: bodyData.id }, data, function (err, update) {
                                if (err) {
                                    console.log(err)
                                    response.setError(AppCode.Fail);
                                    response.send(res);
                                } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                                    response.setError(AppCode.NotFound);
                                    response.send(res);
                                } else {
                                    verificationCodeModel.deleteMany({ adminUserId: bodyData.id }, function (err, removecode) {
                                        if (err) {
                                            AppCode.Fail.error = err.message;
                                            response.setError(AppCode.Fail);
                                            response.send(res);
                                        }
                                        else {
                                            response.setData(AppCode.passwordUpdated);
                                            response.send(res);
                                        }
                                    })
                                }
                            });
                        }
                        else {
                            response.setError(AppCode.PleaseVerifyOTP);
                            response.send(res);
                        }

                    }
                })


            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

adminUserCtrl.changePassword = (req, res) => {
    const response = new HttpRespose();

    try {
        var bodyData = req.body;
        adminUserModel.findOne({ id: bodyData.id }, (err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                // update code
                bcrypt.compare(req.body.oldPassword, getData.password, function (err, pwdResult) {
                    if (pwdResult) {
                        let data = {
                            password: bodyData.newPassword
                        }

                        adminUserModel.updateForgotPassword({ id: bodyData.id }, data, function (err, update) {
                            if (err) {
                                console.log(err)
                                response.setError(AppCode.Fail);
                                response.send(res);
                            } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                                response.setError(AppCode.NotFound);
                                response.send(res);
                            } else {
                                response.setData(AppCode.passwordUpdated);
                                response.send(res);
                            }
                        });
                    }
                    else {
                        response.setError(AppCode.OldPasswordNotMatch);
                        response.send(res);
                    }
                })
            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-User" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}




module.exports = adminUserCtrl;