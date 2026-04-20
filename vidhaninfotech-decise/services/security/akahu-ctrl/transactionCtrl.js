let transactionCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");
const moment_format_compat = (dateStr, fmt) => {
    const { format, parseISO } = require("date-fns");
    // Only convert 'DD' (moment day-of-month) to date-fns 'dd'
    const dfmt = fmt.replace(/DD/g, 'dd');
    try {
        return format(parseISO(dateStr), dfmt);
    } catch {
        return '';
    }
};

const paymentTransactionModel = new (require("../../../common/model/split-payment/paymentTransactionModel"))();
const splitPaymentCategoryModel = new (require("../../../common/model/split-payment/splitPaymentCategoryModel"))();
const splitPaymentModel = new (require("../../../common/model/split-payment/splitPaymentModel"))();
const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const autoPaymentCreateModel = new (require("../../../common/model/akahu-details/autoPaymentCreateModel"))();
const akahuA = new (require("../../../common/model/akahu-details/../../../common/model/akahu-details/akahuAccountModel"))();
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


// cron.schedule("0 0 1 * *", async () => {
//     // cron.schedule("*/10 * * * * *", async () => {
//     try {

//         let accountList = [];
//         let adminAccountData;

//         async.waterfall(
//             [
//                 function (cb) {
//                     // akahu account details
//                     akahuAccountModel.aggregate({ status: 1 }, async (err, accountData) => {
//                         if (err) {
//                             cb(AppCode.Fail)
//                         }
//                         else if (_.isEmpty(accountData)) {
//                             cb(AppCode.NotFound)
//                         }
//                         else {
//                             await Promise.all(
//                                 accountData.map(async (x) => {
//                                     // get akahu user id wise User details
//                                     let userDetails = await getUserIdWiseUserDetails(x.akahuUserId);
//                                     x.userDetails = userDetails;
//                                     x.accountData = akahuUserModel.decryptObject(x.accountData)
//                                 })
//                             )
//                             accountList = accountData.filter(x => x.userDetails.autoPayment == true);
//                             cb()
//                         }
//                     })
//                 },
//                 function (cb) {
//                     // admin account list
//                     adminAccountModel.findByAttribute({ isPrimary: true }, (err, adminAccountDataJSON) => {
//                         if (err) {
//                             cb(AppCode.Fail)
//                         }
//                         else if (_.isEmpty(adminAccountDataJSON)) {
//                             cb(AppCode.NotFound)
//                         }
//                         else {
//                             // get superadmin details
//                             adminUserModel.findByAttribute({ role: 1 }, (err, adminUserData) => {
//                                 if (err) {
//                                     cb(AppCode.Fail)
//                                 }
//                                 else if (_.isEmpty(adminUserData)) {
//                                     adminUserData
//                                     cb(AppCode.NotFound)
//                                 }
//                                 else {
//                                     // setup admin account name and account number and adminaccount user id 
//                                     adminAccountData = {
//                                         name: adminAccountDataJSON.bankName,
//                                         accountNumber: adminAccountDataJSON.accountID,
//                                         adminAccountUser: adminUserData.id,
//                                     }
//                                     cb()
//                                 }
//                             })
//                         }
//                     })
//                 },
//                 function (cb) {
//                     let date = moment_format_compat(, "yyyy-MM-DD");

//                     // account list map
//                     accountList.map(async (x) => {
//                         // check loan details
//                         if (x.accountData && x.accountData.meta) {
//                             // check loan details type if array
//                             if (typeof (x.accountData.meta) == 'object') {
//                                 x.accountData.meta.map(async (y) => {
//                                     let repaymentDate = moment_format_compat(y.loan_details.repayment.next_date, "yyyy-MM-DD");
//                                     // match current date with repayment date
//                                     if (date == repaymentDate) {

//                                         // create payment object
//                                         let paymentObject = {
//                                             "from": x.accountData._id,
//                                             "to": {
//                                                 "name": y.payment_details.account_holder,
//                                                 "account_number": y.payment_details.account_number
//                                             },
//                                             "amount": y.loan_details.repayment.next_amount,
//                                         }

//                                         // call make payment function and create payment
//                                         await makePayment(paymentObject, x.userDetails.access_token, adminAccountData, x.userDetails.id)
//                                     }
//                                 })
//                             }
//                             // check loan details type if object 
//                             else if (typeof (x.accountData.meta) == 'string') {
//                                 let repaymentDate = moment_format_compat(x.accountData.meta.loan_details.repayment.next_date, "yyyy-MM-DD");
//                                 if (date == repaymentDate) {
//                                     let paymentObject = {
//                                         "from": x.accountData._id,
//                                         "to": {
//                                             "name": x.accountData.meta.payment_details.account_holder,
//                                             "account_number": x.accountData.meta.payment_details.account_number
//                                         },
//                                         "amount": x.accountData.meta.loan_details.repayment.next_amount,
//                                     }
//                                     await makePayment(paymentObject, x.userDetails.access_token, adminAccountData, x.userDetails.id)
//                                 }
//                             }
//                         }
//                     })
//                     cb()
//                 }
//             ]
//         )
//     } catch (error) {
//         console.log("Error in cron job", error);
//     }
// });

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
                            isAuto: 4
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
                                        console.log("completed");
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
                        // status: makePayment.status,
                        status: error.response.data.success == false ? 'FAILED' : '',
                        receiverId: paymentObj.to.account_number,
                        receiverName: paymentObj.to.name,
                        connectionName: '',
                        isAuto: 4,
                        reason: paymentFailReason,
                    }

                    paymentTransactionModel.create(obj, async (err, paymentTransactionCreate) => {
                        if (err) {
                            reject(AppCode.Fail);
                        }
                        else {
                            resolve(error);
                        }
                    })
                }
            }
        });

    })
}

const categoryList = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            splitPaymentCategoryModel.get((error, categoryData) => {
                if (error) {
                    reject(error);
                }
                else {
                    categoryData.map(x => {
                        if (x.akahuGroupId) {
                            x.akahuGroupId = akahuAccountModel.decrypt(x.akahuGroupId)
                        }
                    })

                    resolve(categoryData);
                }
            })
        } catch (error) {
            reject(error);
        }
    })
};

transactionCtrl.transactionList = async (req, res) => {
    var response = new HttpRespose();

    try {
        // const getTransactionDetails = await akahu.payments.list(req.payload.access_token);

        let akahuUserList = [];

        const categoryLists = await categoryList()

        async.waterfall(
            [
                function (cb) {
                    akahuUserModel.get((err, akahuUserData) => {
                        if (err) {
                            console.log("userDetailsGet", err);
                            cb(err);
                        }
                        else if (_.isEmpty(akahuUserData)) {
                            console.log("akahuUserDataNotFound");
                            cb(AppCode.NotFound)
                        }
                        else {
                            akahuUserList = akahuUserData;
                            cb()
                        }
                    });
                },
                function (cb) {
                    paymentTransactionModel.aggregate({ userId: req.payload.id }, (err, transactions) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(transactions)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            let TransactionMainList = [];
                            transactions.map((x) => {
                                if (x.isAuto == 1) {
                                    x.userName = akahuUserList.filter((y) => y.id == x.userId)[0].preferred_name;
                                    if (!x.receiverName) {
                                        x.receiverName = akahuUserList.filter((y) => y.id == x.receiverId)[0].preferred_name;
                                        x.receiverUserProfilePicture = akahuUserList.filter((y) => y.id == x.receiverId)[0]?.profile_picture;
                                    }
                                    x.categoryName = categoryLists.filter((y) => y.id == x.categoryId)[0].name;

                                    TransactionMainList.push(x)
                                }
                                else if (x.isAuto == 2) {
                                    x.userName = akahuUserList.filter((y) => y.id == x.userId)[0].preferred_name;
                                    x.categoryName = categoryLists.filter((y) => y.id == x.categoryId)[0].name;
                                    TransactionMainList.push(x)
                                }
                                else if (x.isAuto == 4) {
                                    x.userName = akahuUserList.filter((y) => y.id == x.userId)[0].preferred_name;
                                    x.categoryName = categoryLists.filter((y) => y.id == x.categoryId)[0].name;
                                    TransactionMainList.push(x)
                                }
                                // else if (x.isAuto == 3) {
                                //     x.userName = akahuUserList.filter((y) => y.id == x.userId)[0].preferred_name;
                                //     x.categoryName = categoryLists.filter((y) => y.id == x.categoryId)[0].name;
                                // }
                            })
                            TransactionMainList = TransactionMainList.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt))
                            cb(null, TransactionMainList);
                        }
                    })
                }
            ],
            function (err, data) {
                if (err) {
                    let errMessage = { code: 1010, message: "Fail....." };;
                    errMessage.message = err.message
                    response.setError(errMessage);
                    response.send(res)
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )
    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Transction List api" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

// change
transactionCtrl.typeWiseListOfTransactions = async (req, res) => {
    var response = new HttpRespose();

    let transactionList = [];
    let categoryListData = await categoryList();
    const getAccountDetails = await akahuAccountModel.getAccountDetailsOfUserWise(req.payload.id);

    let queryType = parseInt(req.query.type);
    try {
        async.waterfall(
            [
                function (cb) {
                    paymentTransactionModel.aggregate({ userId: req.payload.id }, (err, transactions) => {
                        if (err) {
                            cb(AppCode.SomethingWrong);
                        }
                        else {
                            transactionList = !!transactions ? transactions : [];
                            if (transactionList.length > 0) {
                                transactionList = transactionList.filter(x => x.type != "FAILED")
                            }
                            cb();
                        }
                    })
                },
                function (cb) {
                    let categoriesTotalList = [];

                    let mainTotal = 0;
                    let appTransactionTotal = 0;
                    let totalAccountBalance = 0;
                    let totalSavingAccountBalance = 0;
                    let oldTransactionTotal = 0;
                    let transactionCategoryWiseList = [];

                    if (!!getAccountDetails && getAccountDetails.length > 0) {
                        const accountData = getAccountDetails.map((x) => { return x.accountData });
                        let plusTotal = 0;
                        let minusTotal = 0;
                        let plusSavingTotal = 0;
                        let minusSavingTotal = 0;
                        accountData.map((x, index) => {
                            if (Object.keys(x.balance).length > 0) {
                                if (x.type == 'SAVINGS') {
                                    if (x.balance.current >= 0) {
                                        plusSavingTotal = plusSavingTotal + x.balance.current
                                    }
                                    else {
                                        minusSavingTotal = minusSavingTotal + x.balance.current
                                    }
                                }
                                else {
                                    if (x.balance.current >= 0) {
                                        plusTotal = plusTotal + x.balance.current
                                    }
                                    else {
                                        minusTotal = minusTotal + x.balance.current
                                    }
                                }
                            }

                            if (index + 1 == getAccountDetails.length) {
                                totalAccountBalance = plusTotal + minusTotal
                                totalSavingAccountBalance = plusSavingTotal + minusSavingTotal
                            }
                        })
                    }

                    categoryListData.map(async (x, i) => {
                        if (queryType == 1 && !!x.akahuGroupId) {

                            if (transactionList.length > 0) {
                                let checkCategory = transactionList.filter((y) => y.categoryId == x.id);
                                if (checkCategory.length > 0) {
                                    checkCategory.map(z => {
                                        z.categoryName = x.name;
                                        z.createdAt = typeof (z.createdAt) == 'string' ? z.createdAt : null;
                                        transactionCategoryWiseList.push(z)
                                    })
                                }
                            }
                            let groupIdDecrept;
                            groupIdDecrept = x.id;
                            if (transactionList.length > 0) {
                                let checkGroupId = transactionList.filter(y => groupIdDecrept == y.categoryId);
                                x.total = 0;
                                x.minusTotal = 0;
                                x.plusTotal = 0;
                                if (checkGroupId.length > 0) {
                                    let checkGroupWiseOldTransactions = checkGroupId.filter((z) => z.isAuto == 3);
                                    if (checkGroupWiseOldTransactions.length > 0) {
                                        checkGroupWiseOldTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                oldTransactionTotal = oldTransactionTotal + x.total
                                                // mainTotal = mainTotal + x.total
                                            }
                                        })
                                    }

                                    let checkGroupWiseAppTransactions = checkGroupId.filter((z) => z.isAuto == 1);
                                    if (checkGroupWiseAppTransactions.length > 0) {
                                        checkGroupWiseAppTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                appTransactionTotal = appTransactionTotal + x.total
                                            }
                                        })
                                    }
                                }
                            }
                            else {
                                x.total = 0;
                            }
                            mainTotal = (appTransactionTotal + oldTransactionTotal);
                            categoriesTotalList.push({ name: x.name, total: x.total });
                        }
                        else if (queryType == 2 && x.name == "Savings") {
                            if (transactionList.length > 0) {
                                let checkCategory = transactionList.filter((y) => y.categoryId == x.id);
                                if (checkCategory.length > 0) {
                                    checkCategory.map(z => {
                                        z.categoryName = x.name;
                                        z.createdAt = typeof (z.createdAt) == 'string' ? z.createdAt : null;
                                        transactionCategoryWiseList.push(z)
                                    })
                                }
                            }
                            let groupIdDecrept;
                            groupIdDecrept = x.id;
                            if (transactionList.length > 0) {
                                let checkGroupId = transactionList.filter(y => groupIdDecrept == y.categoryId);
                                x.total = 0;
                                x.minusTotal = 0;
                                x.plusTotal = 0;
                                if (checkGroupId.length > 0) {
                                    let checkGroupWiseOldTransactions = checkGroupId.filter((z) => z.isAuto == 3);
                                    if (checkGroupWiseOldTransactions.length > 0) {
                                        checkGroupWiseOldTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                oldTransactionTotal = oldTransactionTotal + x.total
                                                // mainTotal = mainTotal + x.total
                                            }
                                        })
                                    }

                                    let checkGroupWiseAppTransactions = checkGroupId.filter((z) => z.isAuto == 1);
                                    if (checkGroupWiseAppTransactions.length > 0) {
                                        checkGroupWiseAppTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                appTransactionTotal = appTransactionTotal + x.total
                                            }
                                        })
                                    }
                                }
                            }
                            else {
                                x.total = 0;
                            }
                            mainTotal = (appTransactionTotal + oldTransactionTotal);
                            categoriesTotalList.push({ name: x.name, total: x.total });
                        }
                        else if (queryType == 3 && x.name == "Investments") {
                            if (transactionList.length > 0) {
                                let checkCategory = transactionList.filter((y) => y.categoryId == x.id);
                                if (checkCategory.length > 0) {
                                    checkCategory.map(z => {
                                        z.categoryName = x.name;
                                        z.createdAt = typeof (z.createdAt) == 'string' ? z.createdAt : null;
                                        transactionCategoryWiseList.push(z)
                                    })
                                }
                            }
                            let groupIdDecrept;
                            groupIdDecrept = x.id;
                            if (transactionList.length > 0) {
                                let checkGroupId = transactionList.filter(y => groupIdDecrept == y.categoryId);
                                x.total = 0;
                                x.minusTotal = 0;
                                x.plusTotal = 0;
                                if (checkGroupId.length > 0) {
                                    let checkGroupWiseOldTransactions = checkGroupId.filter((z) => z.isAuto == 3);
                                    if (checkGroupWiseOldTransactions.length > 0) {
                                        checkGroupWiseOldTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                oldTransactionTotal = oldTransactionTotal + x.total
                                                // mainTotal = mainTotal + x.total
                                            }
                                        })
                                    }

                                    let checkGroupWiseAppTransactions = checkGroupId.filter((z) => z.isAuto == 1);
                                    if (checkGroupWiseAppTransactions.length > 0) {
                                        checkGroupWiseAppTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                appTransactionTotal = appTransactionTotal + x.total
                                            }
                                        })
                                    }
                                }
                            }
                            else {
                                x.total = 0;
                            }
                            mainTotal = (appTransactionTotal + oldTransactionTotal);
                            categoriesTotalList.push({ name: x.name, total: x.total });
                        }
                        else if (queryType == 4 && x.name == "Debts") {
                            if (transactionList.length > 0) {
                                let checkCategory = transactionList.filter((y) => y.categoryId == x.id);
                                if (checkCategory.length > 0) {
                                    checkCategory.map(z => {
                                        z.categoryName = x.name;
                                        z.createdAt = typeof (z.createdAt) == 'string' ? z.createdAt : null;
                                        transactionCategoryWiseList.push(z)
                                    })
                                }
                            }
                            let groupIdDecrept;
                            groupIdDecrept = x.id;
                            if (transactionList.length > 0) {
                                let checkGroupId = transactionList.filter(y => groupIdDecrept == y.categoryId);
                                x.total = 0;
                                x.minusTotal = 0;
                                x.plusTotal = 0;
                                if (checkGroupId.length > 0) {
                                    let checkGroupWiseOldTransactions = checkGroupId.filter((z) => z.isAuto == 3);
                                    if (checkGroupWiseOldTransactions.length > 0) {
                                        checkGroupWiseOldTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                oldTransactionTotal = oldTransactionTotal + x.total
                                                // mainTotal = mainTotal + x.total
                                            }
                                        })
                                    }

                                    let checkGroupWiseAppTransactions = checkGroupId.filter((z) => z.isAuto == 2);
                                    if (checkGroupWiseAppTransactions.length > 0) {
                                        checkGroupWiseAppTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                appTransactionTotal = appTransactionTotal + x.total
                                            }
                                        })
                                    }
                                }
                            }
                            else {
                                x.total = 0;
                            }
                            mainTotal = (appTransactionTotal + oldTransactionTotal);
                            categoriesTotalList.push({ name: x.name, total: x.total });
                        }
                        else if (queryType == 5 && x.name == "Other") {
                            if (transactionList.length > 0) {
                                let checkCategory = transactionList.filter((y) => y.categoryId == x.id);
                                if (checkCategory.length > 0) {
                                    checkCategory.map(z => {
                                        z.categoryName = x.name;
                                        z.createdAt = typeof (z.createdAt) == 'string' ? z.createdAt : null;
                                        transactionCategoryWiseList.push(z)
                                    })

                                }
                            }
                            let groupIdDecrept;
                            groupIdDecrept = x.id;
                            if (transactionList.length > 0) {
                                let checkGroupId = transactionList.filter(y => groupIdDecrept == y.categoryId);
                                x.total = 0;
                                x.minusTotal = 0;
                                x.plusTotal = 0;
                                if (checkGroupId.length > 0) {
                                    let checkGroupWiseOldTransactions = checkGroupId.filter((z) => z.isAuto == 3);
                                    if (checkGroupWiseOldTransactions.length > 0) {
                                        checkGroupWiseOldTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                oldTransactionTotal = oldTransactionTotal + x.total
                                                // mainTotal = mainTotal + x.total
                                            }
                                        })
                                    }

                                    let checkGroupWiseAppTransactions = checkGroupId.filter((z) => z.isAuto == 1);
                                    if (checkGroupWiseAppTransactions.length > 0) {
                                        checkGroupWiseAppTransactions.map((z, index) => {
                                            if (z.netAmount > 0) {
                                                x.plusTotal = x.plusTotal + z.netAmount
                                            }
                                            else {
                                                x.minusTotal = x.minusTotal + z.netAmount
                                            }
                                            if (index + 1 == checkGroupId.length) {
                                                x.total = x.total + (x.plusTotal + x.minusTotal);
                                                appTransactionTotal = appTransactionTotal + x.total
                                            }
                                        })
                                    }
                                }
                            }
                            else {
                                x.total = 0;
                            }
                            mainTotal = (appTransactionTotal + oldTransactionTotal);
                            categoriesTotalList.push({ name: x.name, total: x.total });
                        }
                        if (i + 1 == categoryListData.length) {
                            let object = {
                                transaction: transactionCategoryWiseList.length > 0 ? transactionCategoryWiseList.sort((a, b) => splitPaymentCategoryModel.sortDecendingDate(a.createdAt, b.createdAt)) : [],
                                categoryWiseTotalList: categoriesTotalList,
                                mainTotalAmount: mainTotal,
                                appTransactionTotal: appTransactionTotal,
                                oldTransactionTotal: oldTransactionTotal,
                                totalBalance: queryType == 2 ? totalSavingAccountBalance : totalAccountBalance
                            }
                            cb(null, object)
                        }
                    });
                }
            ],
            function (err, data) {
                if (err) {
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )

    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Trancation Type Wise List" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

// change
transactionCtrl.dashboardListCount = async (req, res) => {
    var response = new HttpRespose();

    await getTransaction(req.payload.access_token, req.payload.id);

    let transactionList = [];
    let categoryListData = await categoryList();

    try {
        async.waterfall(
            [
                function (cb) {
                    paymentTransactionModel.aggregate({ userId: req.payload.id }, (err, transactions) => {
                        if (err) {
                            cb(AppCode.SomethingWrong);
                        }
                        else {
                            transactionList = !!transactions ? transactions : [];
                            if (transactionList.length > 0) {
                                transactionList = transactionList.filter(x => x.type != "FAILED")
                            }
                            cb();
                        }
                    })
                },
                function (cb) {
                    let investmentCategoryListCount = 0;
                    let investmentCategoryListCountOfMinus = 0;

                    let savingListCount = 0;
                    let savingListCountOfMinus = 0;

                    let purchasesAndBudgetTotal = 0;
                    let purchasesAndBudgetTotalOfMinus = 0;

                    let deptsTotal = 0;
                    let deptsTotalOfMinus = 0;

                    let otherTotal = 0;
                    let otherTotalOfMinus = 0;

                    if (transactionList.length > 0) {

                        transactionList.map((tranData, index) => {

                            let checkCategoryWiseCount = categoryListData.filter((y) => y.id == tranData?.categoryId)[0];

                            if (!!checkCategoryWiseCount) {
                                if (!!checkCategoryWiseCount.akahuGroupId) {
                                    if (tranData?.netAmount > 0)
                                        purchasesAndBudgetTotal = purchasesAndBudgetTotal + tranData?.netAmount
                                    else
                                        purchasesAndBudgetTotalOfMinus = purchasesAndBudgetTotalOfMinus + tranData?.netAmount
                                }
                                else if (checkCategoryWiseCount.name == "Investments") {
                                    if (tranData?.netAmount > 0)
                                        investmentCategoryListCount = investmentCategoryListCount + tranData?.netAmount
                                    else
                                        investmentCategoryListCountOfMinus = investmentCategoryListCountOfMinus + tranData?.netAmount
                                }
                                else if (checkCategoryWiseCount.name == "Savings") {
                                    if (tranData?.netAmount > 0)
                                        savingListCount = savingListCount + tranData?.netAmount
                                    else
                                        savingListCountOfMinus = savingListCountOfMinus + tranData?.netAmount
                                }
                                else if (checkCategoryWiseCount.name == "Debts") {
                                    if (tranData?.netAmount > 0)
                                        deptsTotal = deptsTotal + tranData?.netAmount;
                                    else
                                        deptsTotalOfMinus = deptsTotalOfMinus + tranData?.netAmount;
                                }
                                else if (checkCategoryWiseCount.name == "Other") {
                                    if (tranData?.netAmount > 0)
                                        otherTotal = otherTotal + tranData?.netAmount
                                    else
                                        otherTotalOfMinus = otherTotalOfMinus + tranData?.netAmount
                                }
                            }

                            if (index + 1 == transactionList.length) {
                                let object = {
                                    savings: savingListCount + savingListCountOfMinus,
                                    depts: deptsTotal + deptsTotalOfMinus,
                                    purchasesAndBudget: purchasesAndBudgetTotal + purchasesAndBudgetTotalOfMinus,
                                    investments: investmentCategoryListCount + investmentCategoryListCountOfMinus,
                                    other: otherTotal + otherTotalOfMinus,
                                }
                                cb(null, object)
                            }
                        })
                    }
                    else {
                        let object = {
                            savings: savingListCount,
                            depts: 0,
                            purchasesAndBudget: purchasesAndBudgetTotal,
                            investments: investmentCategoryListCount,
                        }
                        cb(null, object)
                    }


                }
            ],
            function (err, data) {
                if (err) {
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )

    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Dashboard List Count" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

transactionCtrl.monthlyEarnings = async (req, res) => {
    var response = new HttpRespose();

    try {
        async.waterfall(
            [
                function (cb) {
                    adminPaymentTransactionModel.get((err, transactions) => {
                        if (err) {
                            cb(AppCode.SomethingWrong);
                        }
                        else {
                            let outputList = [];

                            transactions.map((x) => {
                                x.paymentObject = akahuUserModel.decryptObject(x.paymentObject);
                                x.transactionData = akahuUserModel.decryptObject(x.transactionData);

                                if (x.paymentObject.status && x.paymentObject.status == 'SENT') {
                                    x.createdMonth = new Date(x.createdAt).getMonth() + 1;
                                    x.createdYear = new Date(x.createdAt).getFullYear();
                                    outputList.push(x)
                                }
                            })

                            outputList = outputList.sort((a, b) => akahuUserModel.sortAccendingDate(a.createdAt, b.createdAt));

                            let finalListMonthWise = [];
                            let FinalTotal = 0;
                            for (let index = 1; index < 13; index++) {
                                let currentYear = new Date().getFullYear();
                                let checkMonth = outputList.filter(x => x.createdMonth == index && x.createdYear == currentYear);
                                if (checkMonth.length > 0) {
                                    let totalOfMonth = 0;
                                    checkMonth.forEach(x => {
                                        totalOfMonth = totalOfMonth + parseFloat(x.amount)
                                        FinalTotal = FinalTotal + parseFloat(x.amount)
                                    })
                                    finalListMonthWise.push(parseFloat(totalOfMonth.toFixed(2)));
                                }
                                else {
                                    finalListMonthWise.push(0);
                                }
                            }

                            cb(null, { list: finalListMonthWise, finalTotal: parseFloat(FinalTotal.toFixed(2)) });
                        }
                    })
                }
            ],
            function (err, data) {
                if (err) {
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )

    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Monthly earning" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

transactionCtrl.lastthreeYearEarnings = async (req, res) => {
    var response = new HttpRespose();

    try {
        async.waterfall(
            [
                function (cb) {
                    adminPaymentTransactionModel.get((err, transactions) => {
                        if (err) {
                            cb(AppCode.SomethingWrong);
                        }
                        else {
                            let outputList = [];

                            transactions.map((x) => {
                                x.paymentObject = akahuUserModel.decryptObject(x.paymentObject);
                                x.transactionData = akahuUserModel.decryptObject(x.transactionData);

                                if (x.paymentObject.status && x.paymentObject.status == 'SENT') {
                                    x.createdYear = new Date(x.createdAt).getFullYear()
                                    outputList.push(x)
                                }
                            })

                            outputList = outputList.sort((a, b) => akahuUserModel.sortAccendingDate(a.createdAt, b.createdAt));

                            let finalYearlyBreakUpList = [];
                            let finalYearlyBreakUpYears = [];
                            let FinalTotal = 0;
                            for (let index = 1; index < 4; index++) {
                                let lastYearNumber = ((new Date().getFullYear()) - 3) + index;
                                let checkYear = outputList.filter(x => x.createdYear == lastYearNumber);
                                if (checkYear.length > 0) {
                                    let totalOfYear = 0;
                                    checkYear.forEach(x => {
                                        totalOfYear = totalOfYear + parseFloat(x.amount)
                                        FinalTotal = FinalTotal + parseFloat(x.amount)
                                    })
                                    finalYearlyBreakUpList.push(parseFloat(totalOfYear.toFixed(2)));
                                    finalYearlyBreakUpYears.push(lastYearNumber)
                                }
                                else {
                                    finalYearlyBreakUpYears.push(lastYearNumber)
                                    finalYearlyBreakUpList.push(0);
                                }
                            }

                            cb(null, { list: finalYearlyBreakUpList, year: finalYearlyBreakUpYears, finalTotal: parseFloat(FinalTotal.toFixed(2)) });
                        }
                    })
                }
            ],
            function (err, data) {
                if (err) {
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )

    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Last 3 years Earning" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

transactionCtrl.monthYearList = async (req, res) => {
    var response = new HttpRespose();
    let splitPaymentData = [];


    try {
        async.waterfall(
            [
                function (cb) {
                    splitPaymentModel.get((err, splitPaymentTransactions) => {
                        if (err) {
                            cb(AppCode.SomethingWrong);
                        }
                        else if (_.isEmpty(splitPaymentTransactions)) {
                            cb();
                        }
                        else {
                            splitPaymentTransactions = splitPaymentTransactions.sort((a, b) => akahuUserModel.sortAccendingDate(a.createdAt, b.createdAt))
                            splitPaymentTransactions.map(x => {
                                x.createdMonth = moment_format_compat(x.createdAt, 'MM');
                                x.createdMonthYearName = moment_format_compat(x.createdAt, 'MMMM-yyyy');
                                x.createdMonthYearValue = moment_format_compat(x.createdAt, 'MM-yyyy');
                                x.createdDate = moment_format_compat(x.createdAt, 'DD');
                                x.createdFullDate = moment_format_compat(x.createdAt, 'yyyy-MM-02');
                                x.createdYear = moment_format_compat(x.createdAt, 'yyyy');
                            })

                            splitPaymentTransactions.map(x => {
                                let obj = {
                                    amount: x.totalAmount,
                                    createdMonth: x.createdMonth,
                                    createdMonthYearName: x.createdMonthYearName,
                                    createdMonthYearValue: x.createdMonthYearValue,
                                    createdDate: x.createdDate,
                                    createdFullDate: x.createdFullDate,
                                    createdYear: x.createdYear,
                                }
                                splitPaymentData.push(obj)
                            });

                            cb();
                        }
                    })
                },
                function (cb) {
                    akahuAccountModel.get((err, accountList) => {
                        if (err) {
                            cb(AppCode.SomethingWrong)
                        }
                        else if (_.isEmpty(accountList)) {
                            cb()
                        }
                        else {
                            accountList.map(x => {
                                x.accountData = akahuUserModel.decryptObject(x.accountData);
                            })

                            let newAccountList = [];
                            accountList.filter(x => {
                                if (typeof (x.accountData.meta) == 'string' && !!x.accountData.meta) {
                                    newAccountList.push(x.accountData.meta)
                                }
                                else if (typeof (x.accountData.meta) == 'object' && x.accountData.meta.length > 0) {
                                    x.accountData.meta.filter(y => {
                                        newAccountList.push(y)
                                    })
                                }
                            })


                            newAccountList.map(x => {
                                x.createdMonth = moment_format_compat(x.loan_details.repayment.next_date, 'MM');
                                x.createdMonthYearName = moment_format_compat(x.loan_details.repayment.next_date, 'MMMM-yyyy');
                                x.createdMonthYearValue = moment_format_compat(x.loan_details.repayment.next_date, 'MM-yyyy');
                                x.createdDate = moment_format_compat(x.loan_details.repayment.next_date, 'DD');
                                x.createdFullDate = moment_format_compat(x.loan_details.repayment.next_date, 'yyyy-MM-02');
                                x.createdYear = moment_format_compat(x.loan_details.repayment.next_date, 'yyyy');

                                let obj = {
                                    amount: x.loan_details.repayment.next_amount,
                                    createdMonth: x.createdMonth,
                                    createdMonthYearName: x.createdMonthYearName,
                                    createdMonthYearValue: x.createdMonthYearValue,
                                    createdDate: x.createdDate,
                                    createdFullDate: x.createdFullDate,
                                    createdYear: x.createdYear,
                                }
                                splitPaymentData.push(obj);
                            })
                            cb()
                        }
                    })
                },
                function (cb) {

                    const groupedData = groupByMonthAndYear(splitPaymentData);

                    // Convert grouped data object to array of objects
                    let response = Object.entries(groupedData).map(([name, value]) => ({
                        name: name,
                        value: value.value,
                        date: value.date
                    }));

                    response = response.sort((a, b) => akahuUserModel.sortAccendingDate(a.date, b.date))

                    cb(null, response)

                }
            ],
            function (err, data) {
                if (err) {
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )

    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "monthYearList" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

transactionCtrl.repeatTransactionList = async (req, res) => {
    var response = new HttpRespose();

    try {

        splitPaymentCategoryModel.get((err, categoryList) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else {
                paymentTransactionModel.aggregateByMultipleAttribute({ userId: req.payload.id }, (err, list) => {
                    if (err) {
                        response.setError(AppCode.Fail);
                        response.send(res);
                    }
                    else if (_.isEmpty(list)) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    }
                    else {

                        list = list.filter((x) => x.type != 'FAILED');

                        let uniqueTransactionList = [];
                        const groupedTransactions = {};

                        categoryList.forEach(async (catData, index) => {
                            let transactionListCategoryWise = list.filter((tranData) => tranData.categoryId == catData.id);
                            if (transactionListCategoryWise && transactionListCategoryWise.length > 0) {

                                transactionListCategoryWise.forEach(transaction => {
                                    const receiverName = transaction.receiverName;
                                    if (!groupedTransactions[receiverName]) {
                                        groupedTransactions[receiverName] = {
                                            receiverName: receiverName,
                                            items: [],
                                            lengthOfItems: 0
                                        };
                                    }
                                    groupedTransactions[receiverName].items.push(transaction);
                                    groupedTransactions[receiverName].lengthOfItems++;
                                });
                            }
                            if (categoryList.length == index + 1) {
                                let groupedArray = Object.values(groupedTransactions);
                                groupedArray = groupedArray.sort((a, b) => b.lengthOfItems - a.lengthOfItems);
                                groupedArray = groupedArray.filter(x => x.lengthOfItems > 5 && x.receiverName != 'Other')

                                let finalizeList = [];

                                await Promise.all(groupedArray.map(async (xy) => {
                                    xy.items = xy.items.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt));
                                    xy.items = [xy.items[0]];

                                    let checkAlreadyAutoPayment = await getAutoPaymentCreatedList(xy.receiverName, req.payload.id);

                                    if (checkAlreadyAutoPayment.length == 0) {
                                        finalizeList.push(xy)
                                    }
                                }));

                                response.setData(AppCode.Success, finalizeList);
                                response.send(res);
                            }
                        })
                    }
                })
            }
        })
    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Last 3 years Earning" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

transactionCtrl.deleteTransaction = async (req, res) => {
    var response = new HttpRespose();
    try {
        paymentTransactionModel.deleteMany({ userId: "1707857256486144929297" }, (err, data) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        })
    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Dashboard List Count" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

transactionCtrl.revenuseUpdate = async (req, res) => {
    var response = new HttpRespose();
    let query = req.query;
    let splitPaymentData = [];
    try {
        async.waterfall(
            [
                function (cb) {
                    splitPaymentModel.get((err, splitPaymentTransactions) => {
                        if (err) {
                            cb(AppCode.SomethingWrong);
                        }
                        else if (_.isEmpty(splitPaymentTransactions)) {
                            cb();
                        }
                        else {
                            splitPaymentTransactions = splitPaymentTransactions.sort((a, b) => akahuUserModel.sortAccendingDate(a.createdAt, b.createdAt))
                            splitPaymentTransactions.map(x => {
                                x.createdMonth = moment_format_compat(x.createdAt, 'MM');
                                x.createdMonthYearName = moment_format_compat(x.createdAt, 'MMMM-yyyy');
                                x.createdMonthYearValue = moment_format_compat(x.createdAt, 'MM-yyyy');
                                x.createdDate = moment_format_compat(x.createdAt, 'DD');
                                x.createdFullDate = moment_format_compat(x.createdAt, 'DD-MM-yyyy');
                                x.createdYear = moment_format_compat(x.createdAt, 'yyyy');
                            })

                            splitPaymentTransactions.map(x => {
                                let obj = {
                                    amount: x.totalAmount,
                                    createdMonth: x.createdMonth,
                                    createdMonthYearName: x.createdMonthYearName,
                                    createdMonthYearValue: x.createdMonthYearValue,
                                    createdDate: x.createdDate,
                                    createdFullDate: x.createdFullDate,
                                    createdYear: x.createdYear,
                                }
                                splitPaymentData.push(obj)
                            });

                            cb();
                        }
                    })
                },
                function (cb) {
                    akahuAccountModel.get((err, accountList) => {
                        if (err) {
                            cb(AppCode.SomethingWrong)
                        }
                        else if (_.isEmpty(accountList)) {
                            cb()
                        }
                        else {
                            accountList.map(x => {
                                x.accountData = akahuUserModel.decryptObject(x.accountData);
                            })

                            let newAccountList = [];
                            accountList.filter(x => {
                                if (typeof (x.accountData.meta) == 'string' && !!x.accountData.meta) {
                                    newAccountList.push(x.accountData.meta)
                                }
                                else if (typeof (x.accountData.meta) == 'object' && x.accountData.meta.length > 0) {
                                    x.accountData.meta.filter(y => {
                                        newAccountList.push(y)
                                    })
                                }
                            })


                            newAccountList.map(x => {
                                x.createdMonth = moment_format_compat(x.loan_details.repayment.next_date, 'MM');
                                x.createdMonthYearName = moment_format_compat(x.loan_details.repayment.next_date, 'MMMM-yyyy');
                                x.createdMonthYearValue = moment_format_compat(x.loan_details.repayment.next_date, 'MM-yyyy');
                                x.createdDate = moment_format_compat(x.loan_details.repayment.next_date, 'DD');
                                x.createdFullDate = moment_format_compat(x.loan_details.repayment.next_date, 'DD-MM-yyyy');
                                x.createdYear = moment_format_compat(x.loan_details.repayment.next_date, 'yyyy');

                                let obj = {
                                    amount: x.loan_details.repayment.next_amount,
                                    createdMonth: x.createdMonth,
                                    createdMonthYearName: x.createdMonthYearName,
                                    createdMonthYearValue: x.createdMonthYearValue,
                                    createdDate: x.createdDate,
                                    createdFullDate: x.createdFullDate,
                                    createdYear: x.createdYear,
                                }
                                splitPaymentData.push(obj);
                            })
                            cb()
                        }
                    })
                },
                function (cb) {

                    let totalExpense = 0;
                    splitPaymentData.map(x => {
                        totalExpense += x.amount
                    })

                    const groupedData = groupByMonthAndYearAndDate(splitPaymentData);

                    // Convert grouped data object to array of objects
                    const response = Object.entries(groupedData).map(([key, totalAmount]) => ({
                        amount: totalAmount,
                        createdMonth: key.split('-')[1],
                        createdYear: key.split('-')[0],
                        createdFullDate: key
                    }));

                    let finalResponse = []
                    response.filter(x => {
                        if (x.createdMonth == query.month && x.createdYear == query.year) {
                            finalResponse.push({ y: x.amount, x: x.createdFullDate })
                        }
                    })

                    let totalOfCurrentMonthExpense = 0;
                    finalResponse.map(x => {
                        totalOfCurrentMonthExpense += x.y
                    })

                    cb(null, { totalExpense: parseFloat(totalExpense.toFixed(2)), totalOfCurrentMonthExpense: parseFloat(totalOfCurrentMonthExpense.toFixed(2)), option: finalResponse })

                }
            ],
            function (err, data) {
                if (err) {
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )

    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "revenuseUpdate" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

//Get fail transaction details
transactionCtrl.failureTransactionDetails = async (req, res) => {

    var response = new HttpRespose();

    try {
        paymentTransactionModel.findByAttribute({ id: req.query.id }, async (err, transactions) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(transactions)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {
                let responseData;

                // if (transactions.isAuto == 1) {
                //     const receiverUserDetails = await akahuUserModel.getUserDetailsById({ id: transactions.receiverId });
                //     const receiverAccountDetails = await akahuAccountModel.getAccountDetailsByUserId(transactions.receiverId);


                //     responseData = {
                //         'receiverId': receiverAccountDetails.accountData.formatted_account,
                //         'receiverName': receiverUserDetails.preferred_name,
                //         'amount': transactions.amount,
                //         'reason': transactions.reason,
                //     }
                // }
                // else if (transactions.isAuto == 2) {
                responseData = {
                    'receiverId': transactions.receiverId,
                    'receiverName': transactions.receiverName,
                    'amount': transactions.amount,
                    'reason': transactions.reason,
                    'isAuto': transactions.isAuto
                }
                // }


                response.setData(AppCode.Success, responseData);
                response.send(res);
            }
        })
    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Transction List api" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

// Create Re type Payment
transactionCtrl.reFailedPayment = async (req, res) => {
    var response = new HttpRespose();
    try {
        const { isAuto, senderAccountId, receiverId, receiverName, amount, reason, platformFees, netAmount } = req.body;
        const senderAccountDetails = await akahuAccountModel.getAccountDetails(senderAccountId)
        let receiverUserDetails;
        let receiverAccountDetails;
        let adminAccountData;
        if (isAuto == 1) {
            receiverUserDetails = await akahuUserModel.getUserDetailsById({ id: receiverId });
            receiverAccountDetails = await akahuAccountModel.getAccountDetailsByUserId(receiverId);
        }

        adminAccountModel.findByAttribute({ isPrimary: true }, (err, adminAccountDataJSON) => {
            if (err) {
                cb(AppCode.Fail)
            }
            else if (_.isEmpty(adminAccountDataJSON)) {
                cb(AppCode.NotFound)
            }
            else {
                // get superadmin details
                adminUserModel.findByAttribute({ role: 1 }, async (err, adminUserData) => {
                    if (err) {
                        let errMessage = { code: 1010, message: "Fail....." };;
                        errMessage.message = err.message
                        response.setError(errMessage);
                        response.send(res)
                    }
                    else if (_.isEmpty(adminUserData)) {
                        response.setError(AppCode.NotFound);
                        response.send(res)
                    }
                    else {
                        // setup admin account name and account number and adminaccount user id 
                        adminAccountData = {
                            name: adminAccountDataJSON.bankName,
                            accountNumber: adminAccountDataJSON.accountID,
                            adminAccountUser: adminUserData.id,
                        }

                        let paymentObject = {
                            "from": senderAccountDetails.accountData._id,
                            "to": {
                                "name": isAuto == 1 ? receiverAccountDetails.accountData.name : receiverName,
                                "account_number": isAuto == 1 ? receiverAccountDetails.accountData.formatted_account : receiverId
                            },
                            "amount": amount,
                        }
                        let payment = await makePayment(paymentObject, req.payload.access_token, adminAccountData, req.payload.id)
                        if (!payment) {
                            response.setData(AppCode.Success);
                            response.send(res);
                        }
                        else {
                            let errMessage = { code: 1010, message: "Fail....." };
                            errMessage.message = payment.message;
                            response.setError(errMessage);
                            response.send(res)
                        }
                    }
                })
            }
        })
    } catch (err) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Transction List api" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};


function groupByMonthAndYearAndDate(data) {
    return data.reduce((acc, curr) => {
        const { createdFullDate, amount } = curr;
        const [day, month, year] = createdFullDate.split('-');
        const key = `${year}-${month}-${day}`;

        if (!acc[key]) {
            acc[key] = 0;
        }

        acc[key] += amount;

        return acc;
    }, {});
}

function groupByMonthAndYear(data) {
    return data.reduce((acc, curr) => {
        // const { createdFullDate, amount } = curr;
        // const [day, month, year] = createdFullDate.split('-');
        const key = `${curr.createdMonthYearName}`;

        if (!acc[key]) {
            acc[key] = {
                name: curr.createdMonthYearName,
                value: curr.createdMonthYearValue,
                date: new Date(curr.createdFullDate)
            };
        }


        return acc;
    }, {});
}

const getTransaction = async (token, userId) => {
    return new Promise(async (resolve, reject) => {
        try {

            let oldTransactionListData = await oldTransactionList();

            let transactionList = [];
            let webhook = await akahu.transactions.list(token);
            let categoryListData = await categoryList();
            console.log("webhook.length", webhook.items.length);
            if (webhook.items.length > 0) {
                webhook.items.map((x) => {
                    let checkId = oldTransactionListData.filter(y => y.trans_id == x._id);
                    if (checkId.length == 0) {
                        let receiverNameData = '';

                        if (!!x.merchant) {
                            receiverNameData = x.merchant.name
                        }
                        else {
                            receiverNameData = 'Other'
                        }

                        let categoriesData = '';
                        if (x.category) {
                            categoryListData.filter((cat) => {
                                if (x.type == 'LOAN') {
                                    categoriesData = "1707830735251913348979" // debpts category id
                                }
                                else if (x.category._id == "nzfcc_ckouvvzc2006208ml5mg1cxf7") {
                                    categoriesData = "1705060914460864461096" // investment id
                                }
                                else if (x.category._id == "nzfcc_cl2pgeu3q000109i4368cg786") {
                                    categoriesData = "1705061018964666292093" // saving category id
                                }
                                else if (cat.akahuGroupId == x.category.groups.personal_finance._id) {
                                    categoriesData = cat.id // merchant group id
                                }
                            })
                            if (!categoriesData) {
                                categoriesData = "1709624800694928995635" // other category id
                            }
                        }
                        else {
                            categoriesData = "1709624800694928995635"
                        }

                        let obj = {
                            trans_id: x._id,
                            description: x.description,
                            netAmount: x.amount,
                            amount: x.amount,
                            platformFees: 0,
                            userId: userId,
                            categoryId: categoriesData,
                            type: x.type == "PAYMENT" || x.type == "TRANSFER" ? (x.amount > 0 ? 'CREDIT' : 'DEBIT') : x.type,
                            status: x.type == "PAYMENT" || x.type == "TRANSFER" ? (x.amount > 0 ? 'CREDIT' : 'DEBIT') : x.type,
                            receiverName: receiverNameData,
                            connectionName: '',
                            isAuto: 3,
                            createdAt: typeof (x.created_at) == 'string' ? new Date(x.created_at).toISOString() : null
                        }
                        transactionList.push(obj)
                    }
                })

                if (transactionList.length > 0) {
                    paymentTransactionModel.createMany(transactionList, async (err, paymentTransactionCreate) => {
                        if (err) {
                            reject(AppCode.Fail);
                        }
                        else {
                            resolve();
                        }
                    })
                }
                else {
                    resolve();
                }
            }
            else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    })
};

const oldTransactionList = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            paymentTransactionModel.get((error, transactionData) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(transactionData);
                }
            })
        } catch (error) {
            reject(error);
        }
    })
};

const getAutoPaymentCreatedList = async (name, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            autoPaymentCreateModel.aggregateByMultipleAttribute({ receiverName: name, userId: id }, (error, transactionData) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(transactionData);
                }
            })
        } catch (error) {
            reject(error);
        }
    })
};

module.exports = transactionCtrl;