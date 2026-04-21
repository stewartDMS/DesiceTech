let akahuUserCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");

const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const autoPaymentCreateModel = new (require("../../../common/model/akahu-details/autoPaymentCreateModel"))();
const financialGoalsModel = new (require("../../../common/model/financialGoalsModel"))();
const akahuAccountModel = new (require("../../../common/model/akahu-details/akahuAccountModel"))();
const verificationCodeModel = new (require("../../../common/model/verificationCodeModel"))();
const deviceTokenModel = new (require("../../../common/model/deviceTokenModel"))();
const splitPaymentOrderModel = new (require("../../../common/model/split-payment/splitPaymentOrderModel"))();
const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const { addMonths, parseISO } = require("date-fns");

const { AkahuClient } = require('akahu');
const e = require("express");

const appToken = process.env.AKAHU_APP_TOKEN || CONFIG.AKAHU.APP_TOKEN;
const appSecret = process.env.AKAHU_APP_SECRET || CONFIG.AKAHU.APP_SECRET;
const akahu = new AkahuClient({ appToken: appToken, appSecret: appSecret });
const path = require("path");
const base64Img = require('base64-img');
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

// akahu user details and authentication
akahuUserCtrl.getUserAllData = async (req, res) => {
    var response = new HttpRespose();

    try {
        // const query = {
        //     projection: "id,mobile,email,first_name,last_name,preferred_name,createdAt"
        // }

        akahuUserModel.get((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {

                let allList = [];

                allListData.map(x => {
                    let obj = {
                        id: x.id,
                        preferred_name: x.preferred_name,
                        first_name: x.first_name,
                        last_name: x.last_name,
                        email: x.email,
                        mobile: x.mobile,
                        createdAt: x.createdAt
                    }
                    allList.push(obj);
                })

                response.setData(AppCode.Success, allList);
                response.send(res);
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.allAkahuUserList = async (req, res) => {
    var response = new HttpRespose();
    try {
        if (req.query.splitPaymentId) {
            splitPaymentOrderModel.aggregate({ splitPaymentId: req.query.splitPaymentId }, (err, orderDetails) => {
                if (err) {
                    response.setError({ code: 1010, message: err.message })
                    response.send(res);
                }
                else if (_.isEmpty(orderDetails)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                }
                else {
                    let paymentUserIdList = [];
                    let checkOrderPaymentReceived = orderDetails.filter(x => x.userId != req.payload.id);
                    if (checkOrderPaymentReceived.length > 0) {
                        checkOrderPaymentReceived.map(x => {
                            paymentUserIdList.push(x.userId)
                        })
                    }
                    else {
                        paymentUserIdList = []
                    }

                    akahuUserModel.userNotAggregate(req.payload.id, (err, allListData) => {
                        if (err) {
                            response.setError(AppCode.Fail);
                            response.send(res);
                        } else if (_.isEmpty(allListData)) {
                            response.setError(AppCode.NotFound);
                            response.send(res);
                        } else {
                            let allList = [];

                            if (paymentUserIdList.length > 0) {
                                paymentUserIdList.map(x => {
                                    let checkid = allListData.filter(y => x == y.id);
                                    if (checkid.length > 0) {
                                        let index = allListData.indexOf(checkid[0]);
                                        allListData.splice(index, 1)
                                    }
                                })
                            }

                            allListData.map(x => {
                                if (!!x.first_name && !!x.last_name && !!x.email && !!x.mobile && !!x.preferred_name && !!x.mpin) {
                                    let obj = {
                                        id: x.id,
                                        mobile: x.mobile,
                                        email: x.email,
                                        first_name: x.first_name,
                                        last_name: x.last_name,
                                        preferred_name: x.preferred_name,
                                        createdAt: x.createdAt,
                                        profile_picture: x?.profile_picture
                                    }
                                    allList.push(obj)
                                }
                            })
                            response.setData(AppCode.Success, allList);
                            response.send(res);
                        }
                    });
                }
            })
        }
        else {
            akahuUserModel.userNotAggregate(req.payload.id, (err, allListData) => {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else if (_.isEmpty(allListData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                } else {
                    let allList = []

                    allListData.map(x => {
                        if (!!x.first_name && !!x.last_name && !!x.email && !!x.mobile && !!x.preferred_name && !!x.mpin) {
                            let obj = {
                                id: x.id,
                                mobile: x.mobile,
                                email: x.email,
                                first_name: x.first_name,
                                last_name: x.last_name,
                                preferred_name: x.preferred_name,
                                createdAt: x.createdAt,
                                profile_picture: x?.profile_picture
                            }
                            allList.push(obj)
                        }
                    })

                    response.setData(AppCode.Success, allList);
                    response.send(res);
                }
            });
        }
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.getUserDetails = (req, res) => {
    var response = new HttpRespose();

    try {
        const query = {
            id: req.payload.id,
        }
        akahuUserModel.findOne(query, async (err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                let financialGoalList = [];

                async.waterfall(
                    [
                        function (cb) {
                            financialGoalsModel.get((err, financialList) => {
                                if (err) {
                                    financialGoalList = null;
                                    cb();
                                }
                                else {
                                    financialGoalList = financialList;
                                    cb()
                                }
                            })
                        },
                        function (cb) {

                            let financialGoalData = [];

                            if (!!financialGoalList && financialGoalList.length > 0) {
                                if (!!allListData && !!allListData.financialGoals) {
                                    allListData.financialGoals.map(x => {
                                        let matchGoal = financialGoalList.filter((y) => y.id == x);
                                        financialGoalData.push(matchGoal[0]);
                                    })

                                    var groupList = financialGoalData.reduce((acc, curr, index) => {
                                        const existingGroupId = acc.find((group) => group.group === curr.group);

                                        if (existingGroupId) {
                                            existingGroupId.goals.push({ name: curr.name, id: curr.id });
                                        } else {
                                            acc.push({
                                                group: curr.group,
                                                goals: [{ name: curr.name, id: curr.id }],
                                            });
                                        }

                                        return acc;
                                    }, []);

                                    groupList = groupList.sort((a, b) => a.group - b.group)

                                    let allListOfFinancialGoals = [];

                                    groupList.map(x => {
                                        let obj = {
                                            groupId: x.group,
                                            group: x?.group == 1 ? 'Debt' : x?.group == 2 ? 'Savings' : x?.group == 3 ? 'Invest' :
                                                x?.group == 4 ? 'Billings' : '',
                                            goals: x.goals
                                        }

                                        allListOfFinancialGoals.push(obj)
                                    })

                                    financialGoalData = allListOfFinancialGoals
                                }
                            }

                            let obj = {
                                id: allListData?.id,
                                mobile: allListData?.mobile,
                                email: allListData?.email,
                                first_name: allListData?.first_name,
                                last_name: allListData?.last_name,
                                profile_picture: allListData?.profile_picture,
                                preferred_name: allListData?.preferred_name,
                                createdAt: allListData?.createdAt,
                                financialGoalData: financialGoalData
                            }
                            cb(null, obj)
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(AppCode.Fail);
                            response.send(res);
                        }
                        else {
                            response.setData(AppCode.Success, data);
                            response.send(res);
                        }
                    }
                )
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.updateUserDetails = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    var id = req.body.id;
    delete data.id;
    try {
        akahuUserModel.findByAttribute({ email: req.body.email }, async (err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {

                if (req.files && req.files.profile_picture && req.files.profile_picture.length > 0) {
                    data.profile_picture = req.files.profile_picture[0].location
                }

                // if (!!data.profile_picture) {
                //     // Extract the data part of the Base64 string
                //     // const base64Image = data.profile_picture.split(';base64,').pop();
                //     // const extension = data.profile_picture.split('/')[1].split(';')[0];
                //     // Convert Base64 to binary data

                //     // Write the binary data to a file
                //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                //     const fileName = "profile_picture-" + uniqueSuffix + "." + extension;

                //     await decodeBase64(data.profile_picture, fileName)
                //     data.profile_picture = fileName;
                // }

                if (!data.preferred_name) {
                    data.preferred_name = data.first_name + " " + data.last_name
                }

                if (data.autoPayment) {
                    data.autoPayment = JSON.parse(data.autoPayment)
                }

                akahuUserModel.update({ id: id }, data, function (err, update) {
                    if (err) {
                        console.log(err)
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                        response.setError(AppCode.NotFound);
                    } else {
                        akahuUserModel.generateSessionToken({ id: id }, (err, data) => {
                            if (err) {
                                response.setError(AppCode.InternalServerError);
                                response.send(res);
                            }
                            else {
                                data = akahuAccountModel.encryptObject(data);
                                response.setData(AppCode.updatedAkahuUserDetails, data);
                                response.send(res);
                            }
                        })
                    }
                });
            } else {
                // update code
                if (req.body.email == getData.email) {
                    if (req.files && req.files.profile_picture && req.files.profile_picture.length > 0) {
                        data.profile_picture = req.files.profile_picture[0].location
                    }

                    // if (!!data.profile_picture) {
                    //     // Extract the data part of the Base64 string
                    //     // const base64Image = data.profile_picture.split(';base64,').pop();
                    //     // const extension = data.profile_picture.split('/')[1].split(';')[0];
                    //     // Convert Base64 to binary data

                    //     // Write the binary data to a file
                    //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    //     const fileName = "profile_picture-" + uniqueSuffix + ".png";
                    //     const imageData = Buffer.from(data.profile_picture, 'base64');
                    //     await decodeBase64(imageData, fileName)
                    //     data.profile_picture = fileName;
                    // }

                    if (!getData.preferred_name) {
                        data.preferred_name = data.first_name + " " + data.last_name
                    }
                    if (data.autoPayment) {
                        data.autoPayment = JSON.parse(data.autoPayment)
                    }

                    akahuUserModel.update({ id: id }, data, function (err, update) {
                        if (err) {
                            console.log(err)
                            response.setError(AppCode.Fail);
                            response.send(res);
                        } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                            response.setError(AppCode.NotFound);
                        } else {
                            akahuUserModel.generateSessionToken({ id: id }, (err, data) => {
                                if (err) {
                                    response.setError(AppCode.InternalServerError);
                                    response.send(res);
                                }
                                else {
                                    data = akahuAccountModel.encryptObject(data);
                                    response.setData(AppCode.updatedAkahuUserDetails, data);
                                    response.send(res);
                                }
                            })
                        }
                    });
                }
                else {
                    response.setError(AppCode.emailAlreadyExist);
                    response.send(res);
                }

            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError({ code: 1010, message: error.message });
            response.send(res);
        });
    }
};

// function decodeBase64(base64Image, fileName) {
function decodeBase64(imageData, fileName) {
    let dirPath = path.join(__dirname, '../../../uploads/images/' + fileName)
    // const binaryData = Buffer.from(base64Image, 'base64');

    // fs.writeFile(dirPath, binaryData, { encoding: 'base64' }, function (err) {
    //     if (err) {
    //         console.error('Error:', err);
    //     } else {
    //         console.log('Image file created successfully!');
    //         return
    //     }
    // });

    fs.writeFile(dirPath, imageData, (err) => {
        if (err) throw err;
        console.log('Image saved as image.png');
    });
}

akahuUserCtrl.updateUserFinancialGoal = (req, res) => {
    var response = new HttpRespose();
    try {
        var data = req.body;
        akahuUserModel.findByAttribute({ id: req.payload.id }, (err, getData) => {
            if (err) {
                let appCodeFail = { code: 1010, message: "Fail....." };
                appCodeFail.message = err.message
                response.setError(appCodeFail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                akahuUserModel.update({ id: req.payload.id }, data, function (err, update) {
                    if (err) {
                        console.log(err)
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    } else {
                        response.setError({ code: 200, message: "Update Financial Goals." });
                        response.send(res);
                    }
                });
            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.loginMPIN = (req, res) => {
    const response = new HttpRespose();
    try {
        let idObj;
        if (req.body.id) {
            idObj = {
                id: req.body.id
            }
        }
        else {
            idObj = {
                email: req.body.email
            }
        }

        akahuUserModel.findByAttribute(idObj, (err, akahuUserData) => {
            if (err) {
                response.setError(AppCode.InternalServerError);
                response.send(res);
            } else {
                if (akahuUserData === null || _.isEmpty(akahuUserData)) {
                    response.setError(AppCode.EmailNotValid);
                    response.send(res);
                } else {

                    if (!!req.body.email && !req.body.mpin) {
                        if (!!akahuUserData.first_name && !!akahuUserData.last_name && !!akahuUserData.mpin && !!akahuUserData.preferred_name && !!akahuUserData.mobile) {
                            let obj = {
                                isProfileComplte: true,
                                userName: akahuUserData.first_name + " " + akahuUserData.last_name,
                                userData: akahuUserModel.encryptObject(akahuUserData)
                            }
                            response.setData(AppCode.emailVerified, obj);
                            response.send(res);
                            return
                        }
                        else {
                            let obj = {
                                isProfileComplte: false,
                                userName: akahuUserData.first_name + " " + akahuUserData.last_name,
                                userData: akahuUserModel.encryptObject(akahuUserData)
                            }
                            response.setData(AppCode.emailVerified, obj);
                            response.send(res);
                            return
                        }
                    }

                    if (req.body.mpin != akahuUserData.mpin) {
                        response.setError(AppCode.mpinNotMatch);
                        response.send(res);
                    }
                    else {
                        akahuUserModel.generateSessionToken(idObj, (err, data) => {
                            if (err) {
                                response.setError(AppCode.InternalServerError);
                                response.send(res);
                            }
                            else {

                                data = akahuAccountModel.encryptObject(data);
                                response.setData(AppCode.LoginSuccess, data);
                                console.log("login data", response);
                                response.send(res);
                            }
                        })

                        // let deviceTokenInfo = req.body.deviceTokenInfo;

                        // deviceTokenModel.deleteMany({ akahuUserId: req.body.id }, (err, deleteData) => {
                        //     if (err) {
                        //         response.setError(AppCode.InternalServerError);
                        //         response.send(res);
                        //     }
                        //     else {
                        //         let obj = {
                        //             akahuUserId: req.body.id,
                        //             deviceId: deviceTokenInfo.deviceId,
                        //             deviceType: deviceTokenInfo.deviceType,
                        //             deviceToken: deviceTokenInfo.deviceToken,
                        //         };

                        //         deviceTokenModel.create(obj, (err, createData) => {
                        //             if (err) {
                        //                 response.setError(AppCode.InternalServerError);
                        //                 response.send(res);
                        //             }
                        //             else {

                        //                 // save details and send response code .....
                        //                 response.setData(AppCode.LoginSuccess);
                        //                 response.send(res);
                        //             }
                        //         })
                        //     }
                        // })
                    }
                }
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

akahuUserCtrl.sendOTP = (req, res) => {
    const response = new HttpRespose();

    try {
        akahuUserModel.findByAttribute({ email: req.body.email.toLowerCase() }, (err, akahuUserData) => {
            if (err) {
                response.setError(AppCode.InternalServerError);
                response.send(res);
            } else {
                if (akahuUserData === null || !akahuUserData) {
                    response.setError(AppCode.EmailNotValid);
                    response.send(res);
                } else {
                    verificationCodeModel.deleteMany({ adminUserId: akahuUserData.id }, function (err, removecode) {
                        if (err) {
                            AppCode.Fail.error = err.message;
                            response.setError(AppCode.Fail);
                            response.send(res);;
                        }
                        else {
                            let params = {
                                adminUserId: akahuUserData.id,
                            };
                            verificationCodeModel.create(params, (err, code) => {
                                if (err) {
                                    console.log(err.message);
                                    response.setError(AppCode.InternalServerError);
                                    response.send(res);
                                } else {
                                    let mailObj = {
                                        service: CONFIG.MAIL.HOST,
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
                                            from: "bhargav.sankaliya.vidhaninfotech@gmail.com",
                                            to: akahuUserData.email,
                                            subject: 'Forgot MPIN For OTP',
                                            html: htmlToSend,
                                        };
                                        transporter.sendMail(mailOptions, function (error, info) {
                                            if (error) {
                                                console.log("error", error)
                                            } else {
                                                console.log('Email sent: ' + info.response);
                                                response.setData(AppCode.Success, akahuUserData.id);
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
        console.log(error.message);
        errorLogModel.create({ errorMessage: exception.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.SomethingWrong);
            response.send(res);
        });
    }
};

akahuUserCtrl.verifyOTP = (req, res) => {
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
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.mpinUpdate = (req, res) => {
    const response = new HttpRespose();

    try {
        var bodyData = req.body;

        akahuUserModel.findOne({ id: bodyData.id }, (err, getData) => {
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
                                mpin: bodyData.mpin
                            }

                            akahuUserModel.updateData({ id: bodyData.id }, data, function (err, update) {
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
                                            response.setData(AppCode.mpinUpdated);
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
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.changeMPIN = (req, res) => {
    const response = new HttpRespose();

    try {
        var bodyData = req.body;

        akahuUserModel.findOne({ id: bodyData.id }, (err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                // update code

                if (getData.mpin == req.body.oldmpin) {
                    let data = {
                        mpin: bodyData.newmpin
                    }

                    akahuUserModel.updateData({ id: bodyData.id }, data, function (err, update) {
                        if (err) {
                            console.log(err)
                            response.setError(AppCode.Fail);
                            response.send(res);
                        } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                            response.setError(AppCode.NotFound);
                            response.send(res);
                        } else {
                            response.setData(AppCode.mpinUpdated);
                            response.send(res);
                        }
                    });
                }
                else {
                    response.setError(AppCode.OldMPINNotmatch);
                    response.send(res);
                }
            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

}

// get akahu account details and account related ctrl
akahuUserCtrl.getAllAkahuAccounts = async (req, res) => {
    var response = new HttpRespose();

    let akahuAccounts = [];
    try {
        akahuAccounts = await akahu.accounts.list(req.payload.access_token);

        let query = {
            akahuUserId: req.payload.id
        }

        const getAutoPaymentList = await autoPaymentCreateModel.getAutoPaymentListData(req.payload.id);

        akahuAccountModel.aggregate(query, (err, accountList) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else {
                let matchAccountList = [];
                let notMatchAccountList = [];
                let newAccountList = [];

                if (accountList.length > 0) {
                    accountList.map(x => {
                        x.accountData = akahuAccountModel.decryptObject(x.accountData);
                    })
                    accountList.map(x => {
                        const matchAccountIndex = akahuAccounts.filter(y => y._id == x.accountData._id);
                        if (matchAccountIndex.length > 0) {
                            const matchAccountIndexData = akahuAccounts.indexOf(matchAccountIndex[0]);

                            x.accountData.balance = matchAccountIndex[0].balance ? matchAccountIndex[0].balance : {};

                            if (x.accountData.meta && x.accountData.meta.length > 0) {
                                if (!!matchAccountIndex[0].meta) {
                                    let akahuAccountLoanData = matchAccountIndex[0].meta
                                    x.accountData.meta.map(z => {
                                        const oldAccountData = z;

                                        let checkAutoPaymentAmount = [];

                                        if (getAutoPaymentList.length > 0) {
                                            checkAutoPaymentAmount = getAutoPaymentList.find((autoPaymentData) => autoPaymentData.userAccountId == x.id && autoPaymentData.purpose == akahuAccountLoanData.loan_details)
                                        }

                                        z.holder = akahuAccountLoanData.holder;
                                        z.loan_details = akahuAccountLoanData.loan_details;
                                        z.payment_details = akahuAccountLoanData.payment_details;

                                        // if (z.loan_details.repayment.next_amount != oldAccountData.loan_details.repayment.next_amount) {
                                        //     z.loan_details.repayment.next_amount = oldAccountData.loan_details.repayment.next_amount
                                        // }
                                        z.loan_details.repayment.next_amount = (!!checkAutoPaymentAmount && checkAutoPaymentAmount.amount == z.loan_details.repayment.next_amount) ? z.loan_details.repayment.next_amount : checkAutoPaymentAmount.amount;

                                    })
                                }
                                else {
                                    x.accountData.meta = []
                                }
                            }

                            matchAccountList.push(x);
                            akahuAccounts.splice(matchAccountIndexData, 1);
                        }
                        else {
                            notMatchAccountList.push(x);
                        }
                    })
                }

                newAccountList = akahuAccounts;

                async.waterfall(
                    [
                        function (cb) {
                            if (matchAccountList.length > 0) {
                                let data = [];
                                matchAccountList.map(x => {

                                    let akahuAccountObj = {
                                        _id: x?.accountData?._id,
                                        _credentials: x?.accountData?._credentials,
                                        name: x?.accountData?.name,
                                        status: x?.accountData?.status,
                                        balance: {
                                            currency: x?.accountData?.balance?.currency,
                                            current: x?.accountData?.balance?.current,
                                            available: x?.accountData?.balance?.available,
                                            limit: x?.accountData?.balance?.limit,
                                            overdrawn: x?.accountData?.balance?.overdrawn
                                        },
                                        type: x?.accountData?.type,
                                        attributes: x?.accountData?.attributes,
                                        formatted_account: x?.accountData?.formatted_account,
                                        // meta: [
                                        //     {
                                        //         holder: "Demo CHecking",
                                        //         loan_details:
                                        //         {
                                        //             purpose: "Testing",
                                        //             type: 'UNKNOWN',
                                        //             interest: {
                                        //                 rate: 2,
                                        //                 type: "FIXED",
                                        //                 expires_at: moment().add(3, 'days').toDate()
                                        //             },
                                        //             is_interest_only: "2 Months",
                                        //             interest_only_expires_at: moment().add(3, 'days').toDate(),
                                        //             term: moment().add(3, 'days').toDate(),
                                        //             initial_principal: 2,
                                        //             repayment: {
                                        //                 frequency: 'MONTHLY',
                                        //                 next_date: new Date(moment().toDate()).toISOString(),
                                        //                 next_amount: 3
                                        //             }
                                        //         },
                                        //         payment_details: {
                                        //             account_holder: "Demo Checking",
                                        //             account_number: "99-9999-9999999-91",
                                        //         },
                                        //     },
                                        //     {
                                        //         holder: "Demo CHecking",
                                        //         loan_details:
                                        //         {
                                        //             purpose: "Testing 2",
                                        //             type: 'UNKNOWN',
                                        //             interest: {
                                        //                 rate: 2,
                                        //                 type: "FIXED",
                                        //                 expires_at: moment().add(3, 'days').toDate()
                                        //             },
                                        //             is_interest_only: "2 Months",
                                        //             interest_only_expires_at: moment().add(3, 'days').toDate(),
                                        //             term: moment().add(3, 'days').toDate(),
                                        //             initial_principal: 2,
                                        //             repayment: {
                                        //                 frequency: 'MONTHLY',
                                        //                 next_date: new Date(moment().add(3, 'days').toDate()).toISOString(),
                                        //                 next_amount: 3
                                        //             }
                                        //         },
                                        //         payment_details: {
                                        //             account_holder: "Demo Checking",
                                        //             account_number: "99-9999-9999999-91",
                                        //         },
                                        //     }
                                        // ]
                                        meta: x?.accountData?.meta
                                    }

                                    data.push({ id: x.id, accountData: akahuAccountModel.encryptObject(akahuAccountObj) });
                                })
                                akahuAccountModel.updateMultipleAccountData(data, (err, updateData) => {
                                    if (err) {
                                        cb(AppCode.SomethingWrong)
                                    }
                                    else {
                                        cb();
                                    }
                                })
                            }
                            else {
                                cb()
                            }
                        },
                        function (cb) {
                            if (notMatchAccountList.length > 0) {
                                let ids = [];
                                notMatchAccountList.map(x => {
                                    ids.push({ id: x.id });
                                    x.setAsPrimary = false;
                                })

                                akahuAccountModel.updateMultiple(ids, { status: 2, setAsPrimary: false }, (err, updateData) => {
                                    if (err) {
                                        cb(AppCode.SomethingWrong)
                                    }
                                    else {
                                        cb();
                                    }
                                })
                            }
                            else {
                                cb()
                            }
                        },
                        function (cb) {
                            if (newAccountList.length > 0) {
                                let accountList = [];

                                newAccountList.forEach((x, index) => {
                                    let checkPrimaryTrueIndex = matchAccountList.filter(x => x.setAsPrimary == true);
                                    let flag;
                                    if (checkPrimaryTrueIndex.length > 0) {
                                        flag = false;
                                    }
                                    else {
                                        flag = true;
                                    }

                                    let akahuAccountObj = {
                                        _id: x?.accountData?._id,
                                        _credentials: x?.accountData?._credentials,
                                        name: x?.accountData?.name,
                                        status: x?.accountData?.status,
                                        balance: {
                                            currency: x?.accountData?.balance?.currency,
                                            current: x?.accountData?.balance?.current,
                                            available: x?.accountData?.balance?.available,
                                            limit: x?.accountData?.balance?.limit,
                                            overdrawn: x?.accountData?.balance?.overdrawn
                                        },
                                        type: x?.accountData?.type,
                                        attributes: x?.accountData?.attributes,
                                        formatted_account: x?.accountData?.formatted_account,
                                        meta: {
                                            holder: x?.accountData?.meta?.holder,
                                            loan_details: x?.accountData?.meta?.loan_details,
                                            payment_details: x?.accountData?.meta?.payment_details,
                                        }
                                    }


                                    let obj = {
                                        akahuUserId: req.payload.id,
                                        setAsPrimary: flag,
                                        accountData: akahuAccountModel.encryptObject(akahuAccountObj),
                                        status: 1
                                    }
                                    accountList.push(obj);
                                })

                                let checkTrueData = accountList.filter(x => x.setAsPrimary == true);
                                if (checkTrueData.length == accountList.length) {
                                    accountList.map((x, index) => {
                                        x.setAsPrimary = (index == 0) ? true : false
                                    })
                                }

                                akahuAccountModel.createMany(accountList, (err, data) => {
                                    if (err) {
                                        cb(AppCode.SomethingWrong)
                                    }
                                    else {
                                        cb();
                                    }
                                })
                            }
                            else {
                                cb()
                            }
                        },
                        function (cb) {
                            akahuAccountModel.aggregateByMultipleAttribute({ akahuUserId: req.payload.id, status: 1 }, async (err, accountListData) => {
                                if (err) {
                                    cb(AppCode.SomethingWrong)
                                }
                                else {
                                    accountListData.map(x => {
                                        x.accountData = akahuAccountModel.decryptObject(x.accountData);
                                    })
                                    let autoPaymentList = [];

                                    for (let index = 0; index < accountListData.length; index++) {
                                        const x = accountListData[index];
                                        if (!!x.accountData.meta && x.accountData.meta.length > 0) {
                                            for (let indexY = 0; indexY < x.accountData.meta.length; indexY++) {
                                                const y = x.accountData.meta[indexY];
                                                let object = {
                                                    userId: req.payload.id,
                                                    purpose: y.loan_details.purpose,
                                                    receiverName: y.payment_details.account_holder,
                                                    receiverAccountNumber: y.payment_details.account_number,
                                                    amount: y.loan_details.repayment.next_amount,
                                                    autoPaymentDate: new Date(y.loan_details.repayment.next_date).toISOString(),
                                                    createdBy: req.payload.id,
                                                    userAccountId: x.id,
                                                    paymentType: 4,
                                                    type: 1,
                                                }
                                                autoPaymentList.push(object);
                                                if (x.accountData.meta.length == indexY + 1) {
                                                    await autoPaymentCreateModel.findSingleAndIfExtraThenRemoveIt(autoPaymentList, req.payload.id, x.id);
                                                }
                                            }
                                        }
                                        else {
                                            await autoPaymentCreateModel.findAutoPaymentAndDeleteIt(req.payload.id, x.id);
                                        }
                                    }

                                    if (autoPaymentList.length > 0) {
                                        console.log("setData");
                                        for (let index = 0; index < autoPaymentList.length; index++) {
                                            const element = autoPaymentList[index];
                                            let checkFlag = await autoPaymentCreateModel.findAndUpdateAndCreate(element);

                                            if (index + 1 == autoPaymentList.length) {
                                                cb(null, accountListData)
                                            }
                                        }
                                    }
                                    else {
                                        cb(null, accountListData)
                                    }
                                }
                            })
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(AppCode.SomethingWrong);
                            response.send(res);
                        }
                        else {
                            response.setData(AppCode.Success, data);
                            response.send(res);
                        }
                    }
                )
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.NotFound);
            response.send(res);
        });
    }
};

akahuUserCtrl.setAsPrimaryAccount = async (req, res) => {
    var response = new HttpRespose();
    try {
        var id = req.query.id;
        var akahuUserId = req.payload.id;

        akahuAccountModel.getSetPrimaryForData(id, akahuUserId, (err, FalseData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(FalseData)) {
                response.setError(AppCode.DefaultPrimary);
                response.send(res);
            } else {
                let IDs = FalseData;
                akahuAccountModel.updateMultiple(IDs, { setAsPrimary: false }, function (err, updatedData) {
                    if (err) {
                        console.log(err)
                        response.setError(err);
                        response.send(res);
                    } else if (updatedData == undefined || (updatedData.matchedCount === 0 && updatedData.modifiedCount === 0)) {
                        response.setError(AppCode.NotFound);
                    } else {
                        akahuAccountModel.update({ id: id }, { setAsPrimary: true }, function (err, update) {
                            if (err) {
                                console.log(err)
                                response.setError(AppCode.Fail);
                                response.send(res);
                            } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                                response.setError(AppCode.NotFound);
                            } else {
                                response.setData(AppCode.AccountPrimary);
                                response.send(res);
                            }
                        });
                    }
                });
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.getLoanDetails = async (req, res) => {
    var response = new HttpRespose();
    try {

        let loanList = [];

        let getAutoPaymentList = await autoPaymentCreateModel.getAutoPaymentListData(req.payload.id);

        if (getAutoPaymentList.length > 0) {

            getAutoPaymentList = getAutoPaymentList.filter((x) => x.isDeleted == false)

            getAutoPaymentList.map((x) => {

                const todayDate = new Date();
                // const autoPaymentDate = new Date(moment(x.autoPaymentDate).add(new Date().getMonth(), 'M'));
                let autoPaymentDate = new Date(x.autoPaymentDate);
                autoPaymentDate.setMonth(todayDate.getMonth() + 1)

                let setAutoPaymentDate;
                if (todayDate <= autoPaymentDate) {
                    setAutoPaymentDate = autoPaymentDate
                }
                else {
                    setAutoPaymentDate = addMonths(autoPaymentDate instanceof Date ? autoPaymentDate : new Date(autoPaymentDate), 1);
                }

                let loanObject = {
                    accountId: x.id,
                    name: '',
                    status: x.status,
                    accountHolderName: '',
                    payment_details: null,
                    loan_details: {
                        purpose: x.purpose,
                        repayment: {
                            next_date: setAutoPaymentDate,
                            next_amount: x.amount
                        },
                    },
                    type: x.type
                };
                loanList.push({ ...x, autoPaymentDate: setAutoPaymentDate })
            })
        }

        if (_.isEmpty(loanList)) {
            response.setError(AppCode.NotFound);
            response.send(res)
        }
        else {
            response.setData(AppCode.Success, loanList);
            response.send(res)
        }

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

akahuUserCtrl.updateUpcomingLoanAmount = async (req, res) => {
    var response = new HttpRespose();
    try {
        let query = {
            id: req.body.accountId,
        }
        akahuAccountModel.findOne(query, (err, accountList) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else {
                if (_.isEmpty(accountList)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                }
                else {

                    accountList.accountData = akahuAccountModel.decryptObject(accountList.accountData);

                    // accountList.accountData.meta.loan_details.map(x => {
                    //     if (x.purpose == req.body.loanPurpose) {
                    //         x.repayment.next_amount = req.body.amount;
                    //     }
                    // })

                    accountList.accountData.meta.loan_details.repayment.next_amount = req.body.amount;

                    accountList.accountData = akahuAccountModel.encryptObject(accountList.accountData);

                    akahuAccountModel.update({ id: req.body.accountId }, { accountData: accountList.accountData }, (err, update) => {
                        if (err) {
                            response.setError(AppCode.Fail);
                            response.send(res);
                        }
                        else {
                            response.setData(AppCode.Success);
                            response.send(res);
                        }
                    })
                }
            }
        })
    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Akahu Users" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

module.exports = akahuUserCtrl;