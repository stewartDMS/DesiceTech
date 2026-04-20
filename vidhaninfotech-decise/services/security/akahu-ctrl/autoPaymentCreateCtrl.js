let autoPaymentCreateCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");
const { format, addWeeks, addMonths, addYears, parseISO } = require("date-fns");

const paymentTransactionModel = new (require("../../../common/model/split-payment/paymentTransactionModel"))();
const splitPaymentCategoryModel = new (require("../../../common/model/split-payment/splitPaymentCategoryModel"))();
const splitPaymentModel = new (require("../../../common/model/split-payment/splitPaymentModel"))();
const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const autoPaymentCreateModel = new (require("../../../common/model/akahu-details/autoPaymentCreateModel"))();
const akahuA = new (require("../../../common/model/akahu-details/akahuAccountModel"))();
const adminPaymentTransactionModel = new (require("../../../common/model/split-payment/adminPaymentTransactionModel"))();
const { AkahuClient } = require('akahu');
const crypto = require('crypto');
const akahuAccountModel = new (require("../../../common/model/akahu-details/akahuAccountModel"))();
const adminAccountModel = new (require("../../../common/model/adminAccountModel"))();
const adminUserModel = new (require("../../../common/model/adminUserModel"))();

const appToken = process.env.AKAHU_APP_TOKEN || CONFIG.AKAHU.APP_TOKEN;
const appSecret = process.env.AKAHU_APP_SECRET || CONFIG.AKAHU.APP_SECRET;

const akahu = new AkahuClient({ appToken: appToken, appSecret: appSecret });
const cron = require('node-cron');
const errorLogModel = new (require("../../../common/model/errorLogModel"))();
const monitizationModel = new (require("../../../common/model/monitizationModel"))();

// every month
// cron.schedule("0 0 1 * *", async () => {
// every one day
cron.schedule("0 0 * * *", async () => {
    // every second 25 second
    // cron.schedule("*/30 * * * * *", async () => {
    try {

        let accountList = [];
        let adminAccountData;

        async.waterfall(
            [
                function (cb) {
                    // auto payment created data get from database
                    autoPaymentCreateModel.aggregate({ status: 1 }, (err, accountData) => {

                        console.log('accountData', accountData)
                        if (err) {
                            cb(AppCode.Fail)
                        }
                        else if (_.isEmpty(accountData)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            accountList = accountData
                            console.log(accountList);
                            cb()
                        }
                    })
                },
                function (cb) {
                    // admin account list - first get isPrimary data and after get role wise user data and create object
                    adminAccountModel.findByMultipleAttribute({ isPrimary: true }, (err, adminAccountDataJSON) => {
                        console.log("adminAccountDataJSON", adminAccountDataJSON);
                        if (err) {
                            cb(AppCode.Fail)
                        }
                        else if (_.isEmpty(adminAccountDataJSON)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            // get superadmin details
                            adminUserModel.findByAttribute({ role: 1 }, (err, adminUserData) => {
                                if (err) {
                                    cb(AppCode.Fail)
                                }
                                else if (_.isEmpty(adminUserData)) {
                                    adminUserData
                                    cb(AppCode.NotFound)
                                }
                                else {
                                    // setup admin account name and account number and adminaccount user id 
                                    adminAccountData = {
                                        name: adminAccountDataJSON.bankName,
                                        accountNumber: adminAccountDataJSON.accountID,
                                        adminAccountUser: adminUserData.id,
                                    }
                                    cb()
                                }
                            })
                        }
                    })
                },
                function (cb) {
                    let date = format(new Date(), 'yyyy-MM-dd');

                    // account list map
                    if (accountList.length > 0) {

                        accountList.map(async (x) => {

                            // check date if current or not means today date or not 
                            const todayDate = new Date();

                            x.autoPaymentDate = x.paymentType == 1 ? addWeeks(new Date(x.autoPaymentDate), 1) : x.paymentType == 2 ? addMonths(new Date(x.autoPaymentDate), 1) : x.paymentType == 3 ? addYears(new Date(x.autoPaymentDate), 1) : x.autoPaymentDate;
                            
                            let autoPaymentDate = new Date(x.autoPaymentDate);
                            autoPaymentDate.setMonth(todayDate.getMonth() + 1)

                            let setAutoPaymentDate;
                            if (todayDate <= autoPaymentDate) {
                                setAutoPaymentDate = autoPaymentDate
                            }
                            else {
                                setAutoPaymentDate = addMonths(autoPaymentDate instanceof Date ? autoPaymentDate : new Date(autoPaymentDate), 1);
                            }
                            let repaymentDate = format(setAutoPaymentDate instanceof Date ? setAutoPaymentDate : new Date(setAutoPaymentDate), 'yyyy-MM-dd');
                            // match current date with repayment date

                            if (date == repaymentDate) {
                                // get akahu user (auth user details)
                                const getUserDetails = await akahuUserModel.getUserDetailsById({ id: x.userId });
                                // get akahu user (auth user primary account details)
                                const getUserPrimaryAccountDetails = await akahuAccountModel.getAccountDetailsByUserId(x.userId);

                                console.log("getUserDetails", getUserDetails);
                                console.log("getUserPrimaryAccountDetails", getUserPrimaryAccountDetails);

                                // after getting primary account details and user details then create payment object and make payment functionality
                                // create payment object
                                let receiverAccountNumber = autoPaymentCreateModel.decrypt(x.receiverAccountNumber);
                                let paymentObject = {
                                    "from": getUserPrimaryAccountDetails.accountData._id, // sender user account primary details account number
                                    "to": {

                                        "name": x.receiverName, // receiver name - account list mathi get karvanu
                                        "account_number": receiverAccountNumber // receiver account number - account list mathi get karvanu
                                    },
                                    "amount": x.amount,  // account list mathi get karvanu
                                }

                                // call make payment function and create payment
                                // access_token : getUserDetails mathi get karvanu
                                await makePayment(paymentObject, getUserDetails.access_token, adminAccountData, x.userId)

                            }
                            cb()
                        })
                    }
                    else {
                        cb()
                    }
                }
            ]
        )
    } catch (error) {
        console.log("Error in cron job", error);
    }
});

const getUserIdWiseUserDetails = (akahuUserId) => {
    return new Promise((resolve, reject) => {
        try {
            akahuUserModel.findOne({ id: akahuUserId }, async (err, userInfo) => {
                if (err) {
                    reject(err);
                }
                else if (_.isEmpty(userInfo)) {
                    reject(AppCode.NotFound);
                }
                else {
                    userInfo.access_token = akahuUserModel.decrypt(userInfo.access_token);
                    userInfo.akahuUserId = akahuUserModel.decrypt(userInfo.akahuUserId);
                    resolve(userInfo);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}

const makePayment = async (paymentObj, userAccessToken, adminAccountDetails, userId) => {
    return new Promise(async (resolve, reject) => {
        let makePayment = '';
        let platformFees = 0;

        monitizationModel.getRangeWiseData(parseFloat(paymentObj.amount), async (err, rangeWiseList) => {
            if (err) {
                reject(AppCode.Fail);
            } else if (_.isEmpty(rangeWiseList)) {
                reject(AppCode.NotFound);
            } else {

                if (rangeWiseList.paymentMode == 1) {
                    platformFees = platformFees + rangeWiseList.amount
                }
                else {
                    platformFees = (platformFees * rangeWiseList.percentage) / 100
                }

                // make loan amount payment
                try {

                    makePayment = await akahu.payments.create(userAccessToken, paymentObj);

                    if (makePayment.status == 'SENT') {

                        // paymentObj.platformFees = platformFees;
                        // paymentObj.netAmount = paymentObj.amount + platformFees;
                        // paymentObj.paymentId = makePayment._id;
                        // paymentObj.paymentStatus = makePayment.status;
                        // paymentObj.createdBy = userId;

                        // let obj = {
                        //     senderId: userId,
                        //     receiverId: paymentObj.to.account_number,
                        //     receiverName: paymentObj.to.name,
                        //     categoryId: "1707830735251913348979",
                        //     paymentObject: akahuAccountModel.encryptObject(paymentObj),
                        //     transactionData: akahuAccountModel.encryptObject(makePayment)
                        // }

                        let obj = {
                            trans_id: makePayment._id,
                            netAmount: paymentObj.amount + platformFees,
                            amount: paymentObj.amount,
                            platformFees: platformFees,
                            userId: userId,
                            categoryId: "1707830735251913348979",
                            type: makePayment.status == 'SENT' ? 'DEBIT' : makePayment.status,
                            status: makePayment.status,
                            receiverName: paymentObj.to.name,
                            connectionName: '',
                            isAuto: 2
                        }

                        paymentTransactionModel.create(obj, async (err, paymentTransactionCreate) => {
                            if (err) {
                                reject(AppCode.Fail);
                            }
                            else {
                                let transactionData = paymentTransactionCreate;

                                let adminPlatformFeesObject = {
                                    "from": paymentObj.from,
                                    "to": {
                                        "name": adminAccountDetails.name,
                                        "account_number": adminAccountDetails.accountNumber
                                    },
                                    "amount": platformFees
                                }

                                let makePlatformFeePayment = await akahu.payments.create(userAccessToken, adminPlatformFeesObject);

                                let transferObj = {
                                    "amount": transactionData.platformFees,
                                    status: makePlatformFeePayment.status,
                                    paymentId: makePlatformFeePayment._id,
                                    receivedBankDetails: {
                                        "name": adminAccountDetails.name,
                                        "account_number": adminAccountDetails.accountNumber
                                    }
                                }

                                let obj = {
                                    senderId: userId,
                                    receiverId: adminAccountDetails.adminAccountUser,
                                    amount: transactionData.platformFees,
                                    parentTransctionId: transactionData.id,
                                    transactionData: akahuAccountModel.encryptObject(makePlatformFeePayment),
                                    paymentObject: akahuAccountModel.encryptObject(transferObj)
                                }

                                adminPaymentTransactionModel.create(obj, (err, paymentTransactionCreate) => {
                                    if (err) {
                                        reject(AppCode.Fail);
                                    }
                                    else {
                                        console.log("completed", paymentTransactionCreate);
                                        resolve()
                                    }
                                })
                            }
                        })
                    }

                }
                catch (error) {

                    let paymentFailReason = (error.isAkahuError) ? error.response.data.message : AppCode.Fail.message;

                    let obj = {
                        trans_id: makePayment._id,
                        netAmount: paymentObj.amount + platformFees,
                        amount: paymentObj.amount,
                        platformFees: platformFees,
                        userId: userId,
                        categoryId: "1707830735251913348979",
                        type: "FAILED",
                        // status: (makePayment.success == false) ? 'FAILED' : "",
                        status: error.response.data.success == false ? 'FAILED' : '',
                        receiverId: paymentObj.to.account_number,
                        receiverName: paymentObj.to.name,
                        connectionName: '',
                        isAuto: 2,
                        reason: paymentFailReason,
                    }

                    paymentTransactionModel.create(obj, async (err, paymentTransactionCreate) => {

                        if (err) {
                            reject(AppCode.Fail);
                        }
                        else {
                            reject(error);
                        }
                    })
                }
            }
        });

    })
}

autoPaymentCreateCtrl.create = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    data.userId = req.payload.id;
    data.createdBy = req.payload.id;
    data.type = 2;
    data.paymentType = parseInt(data.paymentType);
    data.autoPaymentDate = new Date(data.autoPaymentDate).toISOString();
    data.receiverAccountNumber = splitPaymentCategoryModel.encrypt(data.receiverAccountNumber);
    // create code here;

    autoPaymentCreateModel.create(data, (err, create) => {
        if (err) {
            console.log(err)
            response.setError(AppCode.Fail);
            response.send(res);
        } else {
            response.setData(AppCode.Success, create);
            response.send(res);
        }
    });
};

autoPaymentCreateCtrl.update = (req, res) => {
    var response = new HttpRespose()

    autoPaymentCreateModel.findOne({ id: req.query.id }, (err, getData) => {
        if (err) {
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (_.isEmpty(getData)) {
            response.setError(AppCode.NotFound);
            response.send(res);
        } else {
            // update code
            autoPaymentCreateModel.update({ id: req.query.id }, { amount: parseFloat(req.query.amount), updatedBy: req.payload.id }, function (err, update) {
                if (err) {
                    console.log(err)
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                    response.setError(AppCode.NotFound);
                } else {
                    response.setData(AppCode.Success);
                    response.send(res);
                }
            });
        }
    })
};

autoPaymentCreateCtrl.delete = (req, res) => {
    const response = new HttpRespose();
    try {
        var query = {
            id: req.query.id.toString(),
        }

        autoPaymentCreateModel.delete(query, (err, data) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (data == undefined || data.deletedCount === 0) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

autoPaymentCreateCtrl.activeDeactiveAutoPayment = async (req, res) => {
    var response = new HttpRespose();
    try {
        autoPaymentCreateModel.findByAttribute({ id: req.query.id }, (err, accountData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else {
                autoPaymentCreateModel.update({ id: req.query.id }, { status: accountData.status == 1 ? 2 : 1 }, (err, updateResult) => {
                    if (err) {
                        response.setError(AppCode.Fail);
                        response.send(res);
                    }
                    else {
                        response.setData({ code: 200, message: accountData.status == 2 ? 'Auto Payment Activated.' : 'Auto Payment Deactivated' });
                        response.send(res)
                    }
                })
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Auto Payment Active Deactive APi" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};


module.exports = autoPaymentCreateCtrl;