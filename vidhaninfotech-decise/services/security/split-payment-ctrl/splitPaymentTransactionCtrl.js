let splitPaymentTransactionCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query } = require("express");
const firebaseToken = require("firebase-admin");
const _ = require("lodash");

const notificationModel = new (require("../../../common/model/notificationModel"))();
const splitPaymentModel = new (require("../../../common/model/split-payment/splitPaymentModel"))();
const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const supportTicketModel = new (require("../../../common/model/support-ticket/supportTicketModel"))();
const akahuAccountModel = new (require("../../../common/model/akahu-details/akahuAccountModel"))();
const adminUserModel = new (require("../../../common/model/adminUserModel"))();
const monitizationModel = new (require("../../../common/model/monitizationModel"))();
const adminAccountModel = new (require("../../../common/model/adminAccountModel"))();
const splitPaymentCategoryModel = new (require("../../../common/model/split-payment/splitPaymentCategoryModel"))();
const splitPaymentHistoryModel = new (require("../../../common/model/split-payment/splitPaymentHistoryModel"))();
const splitPaymentOrderModel = new (require("../../../common/model/split-payment/splitPaymentOrderModel"))();
const paymentTransactionModel = new (require("../../../common/model/split-payment/paymentTransactionModel"))();
const adminPaymentTransactionModel = new (require("../../../common/model/split-payment/adminPaymentTransactionModel"))();



const { AkahuClient } = require('akahu');
const e = require("express");
// const appToken = 'app_token_clpu6ruwg000108kx8j0ldurc';
// const appSecret = '7598a85e5b371ac0b4b4e00d0e3d70b39a6d0a8ac7b3eae990461fc6f0e8d6d1';

const appToken = 'app_token_clswintdk000008l5di0dbxvp';
const appSecret = '449f5e4dfa6abcc8aafdda08924ba6316a38c1556917d57b114f4748fd247115';
const akahu = new AkahuClient({ appToken: appToken, appSecret: appSecret });
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

// notification setup baki
splitPaymentTransactionCtrl.create = (req, res) => {
    var response = new HttpRespose();

    try {
        console.log(typeof (req.body));
        var data = typeof (req.body) == 'string' ? (JSON.parse(req.body)) : req.body;

        var transactionCreateData;

        async.waterfall(
            [
                function (cb) {
                    data.categoryId = data.categoryId;

                    if (req.files.splitPaymentPicture && req.files.splitPaymentPicture.length > 0) {
                        data.splitPaymentPicture = req.files.splitPaymentPicture[0].filename
                    }

                    data.totalAmount = parseFloat(data.totalAmount);
                    data.whoPaid = req.payload.id;

                    data.forWhom = JSON.parse(data.forWhom);
                    if (typeof (data.forWhom) == 'object') {
                        if (data.forWhom.length > 0) {
                            let forwhomlist = [];
                            data.forWhom.map((x) => {
                                let obj = {
                                    userId: x.userId,
                                    splitAmount: parseFloat(x.splitAmount)
                                }
                                forwhomlist.push(obj);
                            })
                            data.forWhom = forwhomlist;
                        }
                    }
                    else {
                        data.forWhom = [
                            {
                                userId: data.forWhom.userId,
                                splitAmount: parseFloat(data.forWhom.splitAmount)
                            }
                        ]
                    }

                    data.createdBy = req.payload.id;

                    splitPaymentModel.create(data, (err, createPaymentTransaction) => {
                        if (err) {
                            console.log(err)
                            cb(AppCode.Fail);
                        } else {
                            transactionCreateData = createPaymentTransaction;
                            cb();
                        }
                    });
                },
                function (cb) {
                    let historyObject = {
                        splitPaymentId: transactionCreateData.id,
                        createdBy: req.payload.id,
                        message: "<strong>" + req.payload.preferred_name + " </strong> split for : " + transactionCreateData.purpose
                    }
                    splitPaymentHistoryModel.create(historyObject, (err, createPaymentTransaction) => {
                        if (err) {
                            console.log(err)
                            cb(AppCode.Fail);
                        } else {
                            cb();
                        }
                    });
                },
                function (cb) {
                    let orderList = [];
                    transactionCreateData.forWhom.map(x => {
                        let orderObject = {
                            splitPaymentId: transactionCreateData.id,
                            receivePaymentUserId: req.payload.id,
                            userId: x.userId,
                            categoryId: transactionCreateData.categoryId,
                            amount: parseFloat(x.splitAmount),
                            type: (x.userId != req.payload.id) ? 1 : 2,
                            createdBy: req.payload.id
                        }
                        orderList.push(orderObject);
                    })

                    splitPaymentOrderModel.createMany(orderList, (err, createPaymentTransaction) => {
                        if (err) {
                            console.log(err)
                            cb(AppCode.Fail);
                        } else {
                            let notificationList = [];
                            createPaymentTransaction.filter(x => {
                                if (req.payload.id != x.userId) {
                                    let notificationObj = {
                                        senderId: req.payload.id,
                                        receiverId: x.userId,
                                        msg: "You've received split payment request Amount of $" + x.amount + " for " + transactionCreateData.purpose,
                                        type: 4,
                                        splitPaymentId: x.splitPaymentId
                                    };
                                    notificationList.push(notificationObj)
                                }
                            })

                            notificationModel.createMany(notificationList, (err, notificationData) => {

                                if (err) {
                                    console.log(err)
                                    response.setError(AppCode.Fail);
                                    response.send(res);
                                } else {
                                    response.setData(AppCode.Success);
                                    response.send(res);

                                    // notificationData.forEach((x, index) => {

                                    //     deviceTokenModel.findByAttribute({ akahuUserId: x.receiverId }, (err, tokenData) => {
                                    //         if (err) {
                                    //             response.setError(AppCode.Fail);
                                    //             response.send(res);
                                    //         }
                                    //         else if (_.isEmpty(tokenData)) {
                                    //             response.setError(AppCode.NotFound);
                                    //             response.send(res);
                                    //         }
                                    //         else {
                                    //             sendAdminToTopics(
                                    //                 x.msg,
                                    //                 "Split Payment Request",
                                    //                 x.senderId,
                                    //                 req.payload.preferred_name,
                                    //                 x.type,
                                    //                 tokenData.deviceToken,
                                    //                 x.splitPaymentId,
                                    //                 x.createdAt.toString(),
                                    //                 x.id,
                                    //                 res
                                    //             )
                                    //         }
                                    //     })

                                    // })
                                }
                            })

                        }
                    });
                }
            ],
            function (err, data) {
                if (err) {
                    console.log(err);
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

splitPaymentTransactionCtrl.splitPaymentAllList = (req, res) => {
    const response = new HttpRespose();
    try {

        if (req.query.id) {
            splitPaymentModel.findOne({ id: req.query.id }, (err, splitedData) => {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                }
                else if (_.isEmpty(splitedData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                }
                else {

                    let categoryData;
                    let akahuUserData = [];
                    let orderList = [];

                    async.waterfall(
                        [
                            function (cb) {
                                splitPaymentCategoryModel.findByAttribute({ id: splitedData.categoryId }, (err, cData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(cData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        categoryData = cData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {
                                akahuUserModel.get((err, akahuData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(splitedData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        akahuUserData = akahuData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {
                                splitPaymentOrderModel.aggregate({ splitPaymentId: splitedData.id }, (err, orderData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(orderData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {

                                        orderData.map(x => {
                                            x.userName = akahuUserData.filter(akahu => akahu.id == x.userId)[0].preferred_name;
                                            x.userProfilePicture = akahuUserData.filter(akahu => akahu.id == x.userId)[0].profile_picture;
                                            x.receivePaymentUserName = akahuUserData.filter(akahu => akahu.id == x.receivePaymentUserId)[0].preferred_name;
                                            x.receiveProfilePicture = akahuUserData.filter(akahu => akahu.id == x.receivePaymentUserId)[0].profile_picture;
                                            x.createdByUserName = akahuUserData.filter(akahu => akahu.id == x.createdBy)[0].preferred_name;
                                        })
                                        orderList = orderData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {

                                let obj = {
                                    id: splitedData.id,
                                    purpose: splitedData.purpose,
                                    createdAt: splitedData.createdAt,
                                    totalAmount: splitedData.totalAmount,
                                    categoryId: splitedData.categoryId,
                                    categoryName: categoryData.name,
                                    splitBetweenList: orderList
                                }
                                cb(null, obj)
                            }
                        ],
                        function (err, data) {
                            if (err) {
                                response.setError(err);
                                response.send(res)
                            }
                            else {
                                response.setData(AppCode.Success, data);
                                response.send(res);
                            }
                        }
                    )

                }
            })
        }
        else {
            splitPaymentModel.aggregate({ createdBy: req.payload.id }, (err, splitedData) => {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                }
                else if (_.isEmpty(splitedData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                }
                else {

                    let categoryData = [];
                    let akahuUserData = [];

                    async.waterfall(
                        [
                            function (cb) {
                                splitPaymentCategoryModel.get((err, data) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(splitedData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        categoryData = data;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {
                                akahuUserModel.get((err, akahuData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(splitedData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        akahuUserData = akahuData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {

                                let outputList = []

                                splitedData.filter((splitData, index) => {
                                    let obj = {
                                        id: splitData.id,
                                        purpose: splitData.purpose,
                                        createdAt: splitData.createdAt,
                                        totalAmount: splitData.totalAmount,
                                        forWhom: splitData.forWhom,
                                        categoryId: splitData.categoryId,
                                        categoryName: categoryData.filter(x => x.id == splitData.categoryId)[0].name,
                                        whoPaid: splitData.whoPaid,
                                        whoPaidName: akahuUserData.filter(x => x.id == splitData.whoPaid)[0].preferred_name,
                                    }

                                    outputList.push(obj);

                                    if (splitedData.length == index + 1) {
                                        outputList = outputList.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt))
                                        cb(null, outputList)
                                    }

                                })


                            }
                        ],
                        function (err, data) {
                            if (err) {
                                response.setError(err);
                                response.send(res)
                            }
                            else {
                                response.setData(AppCode.Success, data);
                                response.send(res);
                            }
                        }
                    )

                }
            })
        }

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.splitPaymentAllListForAdmin = (req, res) => {
    const response = new HttpRespose();
    try {

        if (req.query.id) {
            splitPaymentModel.findOne({ id: req.query.id }, (err, splitedData) => {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                }
                else if (_.isEmpty(splitedData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                }
                else {

                    let categoryData;
                    let akahuUserData = [];
                    let orderList = [];

                    async.waterfall(
                        [
                            function (cb) {
                                splitPaymentCategoryModel.findByAttribute({ id: splitedData.categoryId }, (err, cData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(cData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        categoryData = cData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {
                                akahuUserModel.get((err, akahuData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(splitedData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        akahuUserData = akahuData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {
                                splitPaymentOrderModel.aggregate({ splitPaymentId: splitedData.id }, (err, orderData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(orderData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {

                                        orderData.map(x => {
                                            x.userName = akahuUserData.filter(akahu => akahu.id == x.userId)[0].preferred_name;
                                            x.receivePaymentUserName = akahuUserData.filter(akahu => akahu.id == x.receivePaymentUserId)[0].preferred_name;
                                            x.createdByUserName = akahuUserData.filter(akahu => akahu.id == x.createdBy)[0].preferred_name;
                                        })
                                        orderList = orderData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {

                                let obj = {
                                    id: splitedData.id,
                                    purpose: splitedData.purpose,
                                    createdAt: splitedData.createdAt,
                                    totalAmount: splitedData.totalAmount,
                                    categoryId: splitedData.categoryId,
                                    categoryName: categoryData.name,
                                    splitBetweenList: orderList,
                                    whoPaidName: akahuUserData.filter(akahuId => akahuId.id == splitedData.whoPaid)[0].preferred_name
                                }
                                cb(null, obj)
                            }
                        ],
                        function (err, data) {
                            if (err) {
                                response.setError(err);
                                response.send(res)
                            }
                            else {
                                response.setData(AppCode.Success, data);
                                response.send(res);
                            }
                        }
                    )

                }
            })
        }
        else {
            splitPaymentModel.get((err, splitedData) => {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                }
                else if (_.isEmpty(splitedData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                }
                else {

                    let categoryData = [];
                    let akahuUserData = [];

                    async.waterfall(
                        [
                            function (cb) {
                                splitPaymentCategoryModel.get((err, data) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(splitedData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        categoryData = data;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {
                                akahuUserModel.get((err, akahuData) => {
                                    if (err) {
                                        cb(AppCode.Fail);
                                    }
                                    else if (_.isEmpty(splitedData)) {
                                        cb(AppCode.NotFound);
                                    }
                                    else {
                                        akahuUserData = akahuData;
                                        cb()
                                    }
                                })
                            },
                            function (cb) {

                                let outputList = []

                                splitedData.filter((splitData, index) => {
                                    let obj = {
                                        id: splitData.id,
                                        purpose: splitData.purpose,
                                        createdAt: splitData.createdAt,
                                        totalAmount: splitData.totalAmount,
                                        forWhom: splitData.forWhom,
                                        categoryId: splitData.categoryId,
                                        categoryName: categoryData.filter(x => x.id == splitData.categoryId)[0].name,
                                        whoPaid: splitData.whoPaid,
                                        whoPaidName: akahuUserData.filter(x => x.id == splitData.whoPaid)[0].preferred_name,
                                    }

                                    outputList.push(obj);

                                    if (splitedData.length == index + 1) {
                                        outputList = outputList.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt))
                                        cb(null, outputList)
                                    }

                                })


                            }
                        ],
                        function (err, data) {
                            if (err) {
                                response.setError(err);
                                response.send(res)
                            }
                            else {
                                response.setData(AppCode.Success, data);
                                response.send(res);
                            }
                        }
                    )

                }
            })
        }

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.paymentRequest = (req, res) => {
    const response = new HttpRespose();
    try {
        // query get : splitpayment-transactionid and who paid user id

        splitPaymentOrderModel.findByMultipleAttribute({ userId: req.payload.id, type: 2 }, (err, orderData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(orderData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {
                let userList = [];
                let splitPaymentData = [];
                async.waterfall(
                    [
                        function (cb) {
                            akahuUserModel.get((err, userData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else if (_.isEmpty(userData)) {
                                    cb(AppCode.NotFound);
                                }
                                else {
                                    userList = userData;
                                    cb();
                                }
                            })
                        },
                        function (cb) {
                            splitPaymentModel.get((err, splitData) => {
                                if (err) {
                                    cb(AppCode.SomethingWrong);
                                }
                                else if (_.isEmpty(splitData)) {
                                    cb(AppCode.NotFound)
                                }
                                else {
                                    splitPaymentData = splitData;
                                    cb();
                                }
                            })
                        },
                        function (cb) {
                            orderData.map(x => {
                                x.purpose = splitPaymentData.filter(y => y.id == x.splitPaymentId)[0].purpose;
                                x.orderCreaterProfilePicture = userList.filter((y) => y.id == x.receivePaymentUserId)[0].profile_picture;
                                x.receivePaymentUserName = userList.filter(y => y.id == x.receivePaymentUserId)[0].preferred_name;
                            })

                            if (req.query.paymentOrderId) {
                                let returnData = orderData.filter(x => x.id == req.query.paymentOrderId)[0];
                                cb(null, returnData)
                            }
                            else {
                                orderData = orderData.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt))
                                cb(null, orderData)
                            }
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(AppCode.SomethingWrong);
                            response.send(res)
                        }
                        else {
                            response.setData(AppCode.Success, data);
                            response.send(res);
                        }
                    }
                )

            }
        })


    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.makeSplitPayment = (req, res) => {
    const response = new HttpRespose();
    try {
        // paymentOrderId, senderAccountId
        // body data : orderId, amount , platform fees, net amount, senderAccountId
        let bodyData = req.body;

        splitPaymentOrderModel.findByAttribute({ id: bodyData.paymentOrderId }, (err, orderDetails) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(orderDetails)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                let receivePaymentUserAccountDetails;
                let senderUserAccountDetails;
                let transactionData = '';
                let adminUserDetails;

                async.waterfall(
                    [
                        // receive payment user account details
                        function (cb) {
                            akahuAccountModel.findByMultipleAttribute({ akahuUserId: orderDetails.receivePaymentUserId, setAsPrimary: true }, (err, receiveUserAccountDetails) => {
                                if (err) {
                                    cb(err)
                                }
                                else if (_.isEmpty(receiveUserAccountDetails)) {
                                    cb(AppCode.NotFound)
                                }
                                else {
                                    receiveUserAccountDetails.accountData = akahuAccountModel.decryptObject(receiveUserAccountDetails.accountData);
                                    receivePaymentUserAccountDetails = receiveUserAccountDetails
                                    console.log("Hellllllllllll =======> " + receivePaymentUserAccountDetails);
                                    cb()
                                }
                            })
                        },
                        // sender account id wise get account details
                        function (cb) {
                            akahuAccountModel.findOne({ id: bodyData.senderAccountId }, (err, senderAccountDetails) => {
                                if (err) {
                                    cb(err)
                                }
                                else if (_.isEmpty(senderAccountDetails)) {
                                    cb(AppCode.NotFound)
                                }
                                else {
                                    senderAccountDetails.accountData = akahuAccountModel.decryptObject(senderAccountDetails.accountData)
                                    senderUserAccountDetails = senderAccountDetails
                                    cb();
                                }
                            })
                        },
                        function (cb) {
                            adminUserModel.findByAttribute({ role: 1 }, (err, adminData) => {
                                if (err) {
                                    cb(err)
                                }
                                else if (_.isEmpty(adminData)) {
                                    cb(AppCode.NotFound)
                                }
                                else {
                                    adminUserDetails = adminData
                                    cb();
                                }
                            })
                        },
                        // make payment using akahu account id
                        function (cb) {
                            adminAccountModel.findByAttribute({ isPrimary: true }, async (err, adminAccount) => {
                                if (err) {
                                    cb(AppCode.Fail)
                                }
                                else if (_.isEmpty(adminAccount)) {
                                    cb(AppCode.NotFound)
                                }
                                else {
                                    let transferObj = {
                                        "from": senderUserAccountDetails.accountData._id,
                                        "to": {
                                            "name": receivePaymentUserAccountDetails.accountData.name,
                                            // "name": receivePaymentUserAccountDetails.accountData.connection.name,
                                            "account_number": receivePaymentUserAccountDetails.accountData.formatted_account
                                        },
                                        "amount": bodyData.amount,
                                    }

                                    const jsonTransferData = jsonString(transferObj);
                                    console.log(JSON.parse(jsonTransferData));
                                    let paymentSend = '';
                                    try {
                                        paymentSend = await akahu.payments.create(req.payload.access_token, JSON.parse(jsonTransferData));
                                        // transferObj.platformFees = bodyData.platformFees;
                                        // transferObj.netAmount = bodyData.netAmount;
                                        // transferObj.paymentId = paymentSend._id;
                                        // transferObj.paymentStatus = paymentSend.status;
                                        // transferObj.createdBy = req.payload.id;

                                        // // let paymentStatusUpdateWebHook = await akahu.webhooks.subscribe

                                        // let obj = {
                                        //     senderId: req.payload.id,
                                        //     receiverId: receivePaymentUserAccountDetails.akahuUserId,
                                        //     categoryId: orderDetails?.categoryId,
                                        //     paymentObject: akahuAccountModel.encryptObject(transferObj),
                                        //     transactionData: akahuAccountModel.encryptObject(paymentSend)
                                        // }

                                        let obj = {
                                            trans_id: paymentSend._id,
                                            netAmount: bodyData.netAmount,
                                            amount: transferObj.amount,
                                            platformFees: bodyData.platformFees,
                                            userId: req.payload.id,
                                            categoryId: orderDetails?.categoryId,
                                            type: "DEBIT",
                                            status: paymentSend.status,
                                            receiverId: receivePaymentUserAccountDetails.akahuUserId,
                                            connectionName: '',
                                            isAuto: 1,
                                        }

                                        paymentTransactionModel.create(obj, async (err, paymentTransactionCreate) => {
                                            if (err) {
                                                cb(err);
                                            }
                                            else {
                                                transactionData = paymentTransactionCreate;

                                                let adminPlatFormFees = {
                                                    "from": senderUserAccountDetails.accountData._id,
                                                    "to": {
                                                        "name": adminAccount.bankName,
                                                        "account_number": adminAccount.accountID
                                                    },
                                                    "amount": bodyData.platformFees,
                                                }
                                                const jsonPlatformFeeData = jsonString(adminPlatFormFees);
                                                let adminPaymentPlatformFees = '';
                                                try {
                                                    adminPaymentPlatformFees = await akahu.payments.create(req.payload.access_token, JSON.parse(jsonPlatformFeeData));

                                                    let transferObj = {
                                                        "amount": transactionData.platformFees,
                                                        status: adminPaymentPlatformFees.status,
                                                        paymentId: adminPaymentPlatformFees._id,
                                                        receivedBankDetails: {
                                                            "name": adminAccount.bankName,
                                                            "account_number": adminAccount.accountID
                                                        }
                                                    }

                                                    let obj = {
                                                        senderId: req.payload.id,
                                                        receiverId: adminUserDetails.id,
                                                        amount: transactionData.platformFees,
                                                        parentTransctionId: transactionData.id,
                                                        transactionData: akahuAccountModel.encryptObject(adminPaymentPlatformFees),
                                                        paymentObject: akahuAccountModel.encryptObject(transferObj)
                                                    }

                                                    adminPaymentTransactionModel.create(obj, (err, paymentTransactionCreate) => {
                                                        if (err) {
                                                            cb(err);
                                                        }
                                                        else {
                                                            splitPaymentOrderModel.update({ id: bodyData.paymentOrderId }, { type: 2 }, (err, updateOrderType) => {
                                                                if (err) {
                                                                    cb(err)
                                                                }
                                                                else {
                                                                    let notificationObj = {
                                                                        senderId: req.payload.id,
                                                                        receiverId: receivePaymentUserAccountDetails.akahuUserId,
                                                                        msg: "Send split payment Amount of $" + bodyData.amount + ".",
                                                                        type: 5,
                                                                        splitPaymentId: orderDetails.splitPaymentId
                                                                    };
                                                                    notificationModel.create(notificationObj, (err, notificationData) => {
                                                                        if (err) {
                                                                            cb(AppCode.Fail);
                                                                        } else {
                                                                            cb();
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                } catch (error) {

                                                    let transferObj = {
                                                        "amount": transactionData.platformFees,
                                                        status: adminPaymentPlatformFees.status,
                                                        paymentId: adminPaymentPlatformFees._id,
                                                        receivedBankDetails: {
                                                            "name": adminAccount.bankName,
                                                            "account_number": adminAccount.accountID
                                                        }
                                                    }

                                                    let obj = {
                                                        senderId: req.payload.id,
                                                        receiverId: adminUserDetails.id,
                                                        amount: transactionData.platformFees,
                                                        parentTransctionId: transactionData.id,
                                                        transactionData: akahuAccountModel.encryptObject(adminPaymentPlatformFees),
                                                        paymentObject: akahuAccountModel.encryptObject(transferObj)
                                                    }

                                                    adminPaymentTransactionModel.create(obj, (err, paymentTransactionCreate) => {
                                                        if (err) {
                                                            cb(err);
                                                        }
                                                        else {
                                                            cb(error)
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    } catch (error) {
                                        let paymentFailReason = (error.isAkahuError) ? error.response.data.message : AppCode.Fail.message;

                                        // let transferObj = {
                                        //     "from": senderUserAccountDetails.accountData._id,
                                        //     "to": {
                                        //         "name": receivePaymentUserAccountDetails.accountData.name,
                                        //         // "name": receivePaymentUserAccountDetails.accountData.connection.name,
                                        //         "account_number": receivePaymentUserAccountDetails.accountData.formatted_account
                                        //     },
                                        //     "amount": bodyData.amount,
                                        // }
                                        // transferObj.platformFees = bodyData.platformFees;
                                        // transferObj.netAmount = bodyData.netAmount;
                                        // transferObj.paymentId = paymentSend._id ? paymentSend._id : '';
                                        // transferObj.paymentStatus = paymentSend.status ? paymentSend.status : '';
                                        // transferObj.createdBy = req.payload.id;



                                        // let obj = {
                                        //     senderId: req.payload.id,
                                        //     categoryId: orderDetails?.categoryId,
                                        //     receiverId: receivePaymentUserAccountDetails.akahuUserId,
                                        //     paymentObject: akahuAccountModel.encryptObject(transferObj),
                                        //     transactionData: akahuAccountModel.encryptObject({
                                        //         isAkahuError: error.isAkahuError,
                                        //         status: 'FAILED'
                                        //     })
                                        // }

                                        let obj = {
                                            trans_id: paymentSend._id,
                                            netAmount: bodyData.netAmount,
                                            amount: bodyData.amount,
                                            platformFees: bodyData.platformFees,
                                            userId: req.payload.id,
                                            categoryId: orderDetails?.categoryId,
                                            type: "FAILED",
                                            status: error.response.data.success == false ? 'FAILED' : '',
                                            receiverId: receivePaymentUserAccountDetails.akahuUserId,
                                            connectionName: '',
                                            isAuto: 1,
                                            reason: paymentFailReason,
                                        }

                                        paymentTransactionModel.create(obj, async (err, paymentTransactionCreate) => {
                                            if (err) {
                                                cb(err);
                                            }
                                            else {
                                                cb(error);
                                            }
                                        })
                                    }
                                }
                            })
                        },
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
            }
        })
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.userTransactions = async (req, res) => {
    const response = new HttpRespose();
    try {

        let transactionDetailsList = [];
        let akahuUsers = [];
        let adminUserDetails = [];
        let admintransactionDetailsList = [];


        async.waterfall(
            [
                function (callback) {
                    adminUserModel.findByAttribute({ role: 1 }, (err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback(err);
                        }
                        else if (_.isEmpty(allListData)) {
                            callback(AppCode.NotFound);
                        }
                        else {
                            adminUserDetails = allListData;
                            callback();
                        }
                    });
                },
                function (callback) {
                    adminPaymentTransactionModel.get((err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback(err);
                        }
                        else if (_.isEmpty(allListData)) {
                            callback(AppCode.NotFound);
                        }
                        else {
                            admintransactionDetailsList = allListData;
                            callback();
                        }
                    });
                },
                function (callback) {
                    akahuUserModel.get((err, userList) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(err)
                        }
                        else if (_.isEmpty(userList)) {
                            callback(AppCode.NotFound)
                        }
                        else {
                            akahuUsers = userList;
                            callback()
                        }
                    })
                },
                function (callback) {
                    paymentTransactionModel.get((err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback({ code: 1010, message: err.message });
                        }
                        else if (_.isEmpty(allListData)) {
                            callback(AppCode.NotFound);
                        }
                        else {
                            allListData.map(async (x, index) => {

                                x.platformFeesList = [];
                                await Promise.all(admintransactionDetailsList.map(z => {
                                    if (z.parentTransctionId == x.id) {
                                        z.transactionData = paymentTransactionModel.decryptObject(z.transactionData);
                                        z.paymentObject = paymentTransactionModel.decryptObject(z.paymentObject);
                                        z.senderName = akahuUsers.filter(y => y.id == z.senderId)[0].preferred_name;
                                        z.receiverName = adminUserDetails.firstName + " " + adminUserDetails.lastName;
                                        delete z.paymentObject.receivedBankDetails
                                        delete z.paymentObject.paymentId
                                        delete z.transactionData
                                        x.platformFeesList.push(z)
                                    }
                                }))

                                if (index + 1 == allListData.length) {

                                    transactionDetailsList = allListData.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt));
                                    callback();
                                }
                            })
                        }
                    });
                },
                function (callback) {
                    transactionDetailsList.map(x => {
                        if (x.isAuto == 1) {
                            x.receiverUserName = akahuUsers.filter(y => y.id == x.receiverId)[0].preferred_name;
                            x.senderUserName = akahuUsers.filter(y => y.id == x.userId)[0].preferred_name;
                        }
                        else if (x.isAuto == 2) {
                            x.senderUserName = akahuUsers.filter(y => y.id == x.userId)[0].preferred_name;
                        }
                    });
                    callback(null, transactionDetailsList);
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

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.adminTransactions = async (req, res) => {
    const response = new HttpRespose();
    try {

        let adminUserDetails = [];
        let admintransactionDetailsList = [];
        let akahuUsers = [];

        async.waterfall(
            [
                function (callback) {
                    adminUserModel.findByAttribute({ role: 1 }, (err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback(AppCode.Fail);
                        }
                        else if (_.isEmpty(allListData)) {
                            callback(AppCode.NotFound);
                        }
                        else {
                            adminUserDetails = allListData;
                            callback();
                        }
                    });
                },
                function (callback) {
                    adminPaymentTransactionModel.get((err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback(AppCode.Fail);
                        }
                        else if (_.isEmpty(allListData)) {
                            callback(AppCode.NotFound);
                        }
                        else {
                            admintransactionDetailsList = allListData;
                            callback();
                        }
                    });
                },
                function (callback) {
                    akahuUserModel.get((err, userList) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(AppCode.Fail)
                        }
                        else if (_.isEmpty(userList)) {
                            callback(AppCode.NotFound)
                        }
                        else {
                            akahuUsers = userList;
                            callback()
                        }
                    })
                },
                function (callback) {
                    admintransactionDetailsList.map(x => {
                        x.transactionData = paymentTransactionModel.decryptObject(x.transactionData);
                        x.paymentObject = paymentTransactionModel.decryptObject(x.paymentObject);
                        x.senderName = akahuUsers.filter(y => y.id == x.senderId)[0].preferred_name;
                        x.receiverName = adminUserDetails.firstName + " " + adminUserDetails.lastName;
                        delete x.paymentObject.receivedBankDetails
                        delete x.paymentObject.paymentId
                        delete x.transactionData
                    })
                    callback(null, admintransactionDetailsList);
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

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

const sendAdminToTopics = (
    msges,
    title,
    senderId,
    senderName,
    type,
    tokens,
    supportTicketId,
    createdAt,
    notificationId,
    res
) => {
    console.log("In send message", msges);
    var message = {
        notification: {
            body: msges,
            title: title,
        },
        data: {
            senderId: senderId,
            senderName: senderName,
            message: msges,
            type: type,
            supportTicketId: supportTicketId,
            createdAt: createdAt,
            notificationId: notificationId
        },
        apns: {
            headers: {
                "apns-priority": "10",
            },
            payload: {
                aps: {
                    sound: "default",
                },
            },
        },
        token: tokens,
    };

    firebaseToken
        .messaging()
        .send(message)
        .then((response) => {
            console.log("Successfully sent message:", response);
        })
        .catch((error) => {
            console.log("Error sending message:", error);
        });
};


const jsonString = (obj) => {
    const visitedObjects = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (visitedObjects.has(value)) {
                // Circular reference found, discard key
                return;
            }
            // Store the visited object in the set
            visitedObjects.add(value);
        }
        return value;
    });
}


splitPaymentTransactionCtrl.getHomeCount = async (req, res) => {
    const response = new HttpRespose();
    try {

        let monitizationCount = 0;
        let paymentCategoryCount = 0;
        let supportTicketCount = 0;
        let splitPaymentCount = 0;
        let transactionCount = 0;
        let akahuUserCount = 0;
        let adminUserCount = 0;


        async.waterfall(
            [
                function (callback) {
                    monitizationModel.get((err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback(AppCode.Fail);
                        }
                        else {
                            monitizationCount = allListData ? allListData.length : 0;
                            callback();
                        }
                    });
                },
                function (callback) {
                    splitPaymentCategoryModel.get((err, allListData) => {
                        if (err) {
                            console.log("asyn 0 err", err);
                            callback(AppCode.Fail);
                        }
                        else {
                            paymentCategoryCount = allListData ? allListData.length : 0;
                            callback();
                        }
                    });
                },
                function (callback) {
                    supportTicketModel.findByAttribute({ status: 1 }, (err, ticketList) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(AppCode.Fail)
                        }
                        else {
                            supportTicketCount = ticketList ? ticketList.length : 0;
                            callback()
                        }
                    })
                },
                function (callback) {
                    splitPaymentModel.get((err, ticketList) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(AppCode.Fail)
                        }
                        else {
                            splitPaymentCount = ticketList ? ticketList.length : 0;
                            callback()
                        }
                    })
                },
                function (callback) {
                    akahuUserModel.get((err, userlist) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(AppCode.Fail)
                        }
                        else {
                            akahuUserCount = userlist ? userlist.length : 0;
                            callback()
                        }
                    })
                },
                function (callback) {
                    adminUserModel.get((err, userlist) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(AppCode.Fail)
                        }
                        else {
                            adminUserCount = userlist ? userlist.length : 0;
                            callback()
                        }
                    })
                },
                function (callback) {
                    paymentTransactionModel.get((err, paymentList) => {
                        if (err) {
                            console.log("asyn 1 err", err);
                            callback(AppCode.Fail)
                        }
                        else {
                            transactionCount = paymentList ? paymentList.length : 0;
                            callback()
                        }
                    })
                },
                function (callback) {
                    let obj = {
                        monitizationCount: monitizationCount,
                        paymentCategoryCount: paymentCategoryCount,
                        supportTicketCount: supportTicketCount,
                        splitPaymentCount: splitPaymentCount,
                        transactionCount: transactionCount,
                        akahuUserCount: akahuUserCount,
                        adminUserCount: adminUserCount,
                    }
                    callback(null, obj);
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

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.deleteSplitPayment = (req, res) => {
    const response = new HttpRespose();
    try {
        splitPaymentModel.findOne({ id: req.query.id }, (err, splitedData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(splitedData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                async.waterfall(
                    [
                        function (cb) {
                            splitPaymentOrderModel.aggregate({ splitPaymentId: splitedData.id }, (err, orderData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else if (_.isEmpty(orderData)) {
                                    cb(AppCode.NotFound);
                                }
                                else {
                                    let checkOrderData = orderData.filter(x => x.type == 2 && x.userId != req.payload.id);

                                    if (checkOrderData.length > 0) {
                                        cb({ code: 1010, message: "Already Split Payment Order Received, So unable to delete this one." })
                                    }
                                    else {
                                        orderData.forEach((x, index) => {
                                            splitPaymentOrderModel.delete({ id: x.id }, (err, deleteData) => {
                                                if (err) {
                                                    cb({ code: 1010, message: err.message })
                                                }
                                                else {
                                                    if (orderData.length == index + 1) {
                                                        cb();
                                                    }
                                                }
                                            })
                                        })
                                    }
                                }
                            })
                        },
                        function (cb) {
                            splitPaymentModel.delete({ id: req.query.id }, (err, deleteSplitPayment) => {
                                if (err) {
                                    cb({ code: 1010, message: err.message })
                                }
                                else {
                                    cb()
                                }
                            })
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(err);
                            response.send(res)
                        }
                        else {
                            response.setData({ code: 200, message: "Deleted Successfully." });
                            response.send(res);
                        }
                    }
                )

            }
        })
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

splitPaymentTransactionCtrl.updateSplitPaymentUser = (req, res) => {
    var response = new HttpRespose();

    try {
        console.log(typeof (req.body));
        var data = typeof (req.body) == 'string' ? (JSON.parse(req.body)) : req.body;

        var splitPaymentData;
        var transactionCreateData;
        var splitPaymentIdwiseOrderList = [];
        let oldOrderUpdateList = [];
        let newOrderCreateList = [];
        let akahuUsers = [];

        async.waterfall(
            [
                // get akahu user list
                function (cb) {
                    akahuUserModel.get((err, akahuUsersList) => {
                        if (err) {
                            cb(AppCode.Fail)
                        }
                        else if (_.isEmpty(akahuUsersList)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            akahuUsers = akahuUsersList;
                            cb()
                        }
                    })
                },
                // get order details split payment id wise
                function (cb) {
                    splitPaymentOrderModel.aggregate({ splitPaymentId: req.query.splitPaymentId }, (err, orderDetails) => {
                        if (err) {
                            cb(AppCode.Fail)
                        }
                        else if (_.isEmpty(orderDetails)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            splitPaymentIdwiseOrderList = orderDetails;
                            cb()
                        }
                    })
                },
                // update split payment
                function (cb) {
                    data.forWhom = typeof (data.forWhom) == 'string' ? JSON.parse(data.forWhom) : data.forWhom;
                    if (typeof (data.forWhom) == 'object') {
                        if (data.forWhom.length > 0) {
                            let forwhomlist = [];
                            data.forWhom.map((x) => {
                                let obj = {
                                    userId: x.userId,
                                    splitAmount: parseFloat(x.splitAmount)
                                }
                                forwhomlist.push(obj);
                            })
                            data.forWhom = forwhomlist;
                        }
                    }
                    else {
                        data.forWhom = [
                            {
                                userId: data.forWhom.userId,
                                splitAmount: parseFloat(data.forWhom.splitAmount)
                            }
                        ]
                    }
                    splitPaymentModel.update({ id: req.query.splitPaymentId }, data, (err, updateData) => {
                        if (err) {
                            console.log(err)
                            cb(AppCode.Fail);
                        } else {
                            transactionCreateData = data;
                            cb();
                        }
                    });
                },
                // old split payment details 
                function (cb) {
                    splitPaymentModel.findOne({ id: req.query.splitPaymentId }, (err, data) => {
                        if (err) {
                            cb(AppCode.Fail)
                        }
                        else {
                            splitPaymentData = data;
                            cb()
                        }
                    })
                },
                // create history of split payment
                function (cb) {
                    let historyObject = {
                        splitPaymentId: req.query.splitPaymentId,
                        createdBy: req.payload.id,
                        message: "<strong>" + req.payload.preferred_name + " </strong> has update split payment."
                    }
                    splitPaymentHistoryModel.create(historyObject, (err, createPaymentTransaction) => {
                        if (err) {
                            console.log(err)
                            cb(AppCode.Fail);
                        } else {
                            cb();
                        }
                    });
                },
                // check order details and update and create new one
                function (cb) {
                    splitPaymentData.forWhom.map((x, index) => {
                        let orderObject = {
                            splitPaymentId: splitPaymentData.id,
                            receivePaymentUserId: req.payload.id,
                            userId: x.userId,
                            categoryId: splitPaymentData.categoryId,
                            amount: parseFloat(x.splitAmount),
                            type: (x.userId != req.payload.id) ? 1 : 2,
                            createdBy: req.payload.id
                        }

                        // let checkTypeTwo = splitPaymentIdwiseOrderList.filter(y => y.userId == x.userId && y.type == 2);
                        // if (checkTypeTwo.length > 0) {
                        //     let checkIndexOfTypeTwo = splitPaymentIdwiseOrderList.indexOf(checkTypeTwo[0]);
                        //     splitPaymentIdwiseOrderList.splice(checkIndexOfTypeTwo, 1);
                        // }
                        // else {
                        let checkForWhom = splitPaymentIdwiseOrderList.filter(y => y.userId == x.userId && (y.type != 2 || y.type == 2));

                        if (checkForWhom.length > 0) {
                            orderObject.id = checkForWhom[0].id;
                            oldOrderUpdateList.push(orderObject);
                            let checkIndex = splitPaymentIdwiseOrderList.indexOf(checkForWhom[0]);
                            splitPaymentIdwiseOrderList.splice(checkIndex, 1);
                        }
                        else {
                            newOrderCreateList.push(orderObject)
                        }
                        // }

                        // splitPaymentIdwiseOrderList = splitPaymentIdwiseOrderList.filter(y => y.type != 2);

                        if (splitPaymentData.forWhom.length == index + 1) {
                            cb()
                        }
                    })
                },
                // new order list create
                function (cb) {
                    if (newOrderCreateList.length > 0) {
                        splitPaymentOrderModel.createMany(newOrderCreateList, (err, createPaymentTransaction) => {
                            if (err) {
                                console.log(err)
                                cb(AppCode.Fail);
                            } else {
                                let notificationList = [];
                                createPaymentTransaction.filter(x => {
                                    if (req.payload.id != x.userId) {
                                        let notificationObj = {
                                            senderId: req.payload.id,
                                            receiverId: x.userId,
                                            msg: "You've received split payment request Amount of $" + x.amount + " for " + transactionCreateData.purpose,
                                            type: 4,
                                            splitPaymentId: x.splitPaymentId
                                        };
                                        notificationList.push(notificationObj)
                                    }
                                })

                                notificationModel.createMany(notificationList, (err, notificationData) => {

                                    if (err) {
                                        console.log(err)
                                        cb(AppCode.Fail);
                                    } else {
                                        cb();

                                        // notificationData.forEach((x, index) => {

                                        //     deviceTokenModel.findByAttribute({ akahuUserId: x.receiverId }, (err, tokenData) => {
                                        //         if (err) {
                                        //             response.setError(AppCode.Fail);
                                        //             response.send(res);
                                        //         }
                                        //         else if (_.isEmpty(tokenData)) {
                                        //             response.setError(AppCode.NotFound);
                                        //             response.send(res);
                                        //         }
                                        //         else {
                                        //             sendAdminToTopics(
                                        //                 x.msg,
                                        //                 "Split Payment Request",
                                        //                 x.senderId,
                                        //                 req.payload.preferred_name,
                                        //                 x.type,
                                        //                 tokenData.deviceToken,
                                        //                 x.splitPaymentId,
                                        //                 x.createdAt.toString(),
                                        //                 x.id,
                                        //                 res
                                        //             )
                                        //         }
                                        //     })

                                        // })
                                    }
                                })

                            }
                        });
                    }
                    else {
                        cb()
                    }
                },
                // old order list update data 
                function (cb) {
                    if (oldOrderUpdateList.length > 0) {
                        oldOrderUpdateList.map((orderData, index) => {
                            let query = { id: orderData.id }
                            delete orderData.createdBy;
                            delete orderData.id;
                            delete orderData.categoryId;
                            splitPaymentOrderModel.update(query, orderData, (err, createPaymentTransaction) => {
                                if (err) {
                                    console.log(err)
                                    cb(AppCode.Fail);
                                } else {
                                    let notificationList = [];
                                    oldOrderUpdateList.filter(x => {
                                        if (req.payload.id != x.userId) {
                                            let notificationObj = {
                                                senderId: req.payload.id,
                                                receiverId: x.userId,
                                                msg: "You've received split payment request with updated Amount of $" + x.amount + " for " + splitPaymentData.purpose,
                                                type: 4,
                                                splitPaymentId: x.splitPaymentId
                                            };
                                            notificationList.push(notificationObj)
                                        }
                                    })

                                    notificationModel.createMany(notificationList, (err, notificationData) => {
                                        if (err) {
                                            console.log(err)
                                            response.setError({ code: 1010, message: err.message });
                                            cb()
                                        } else {

                                            if (oldOrderUpdateList.length == index + 1) {
                                                cb()
                                            }
                                            // notificationData.forEach((x, index) => {

                                            //     deviceTokenModel.findByAttribute({ akahuUserId: x.receiverId }, (err, tokenData) => {
                                            //         if (err) {
                                            //             response.setError(AppCode.Fail);
                                            //             response.send(res);
                                            //         }
                                            //         else if (_.isEmpty(tokenData)) {
                                            //             response.setError(AppCode.NotFound);
                                            //             response.send(res);
                                            //         }
                                            //         else {
                                            //             sendAdminToTopics(
                                            //                 x.msg,
                                            //                 "Split Payment Request",
                                            //                 x.senderId,
                                            //                 req.payload.preferred_name,
                                            //                 x.type,
                                            //                 tokenData.deviceToken,
                                            //                 x.splitPaymentId,
                                            //                 x.createdAt.toString(),
                                            //                 x.id,
                                            //                 res
                                            //             )
                                            //         }
                                            //     })

                                            // })
                                        }
                                    })

                                }
                            });
                        })
                    }
                    else {
                        cb()
                    }
                },
                // remove any unpaid user on order 
                function (cb) {
                    if (splitPaymentIdwiseOrderList.length > 0) {
                        splitPaymentIdwiseOrderList.map((orderDetailsData, index) => {

                            splitPaymentOrderModel.delete({ id: orderDetailsData.id }, (err, deleteOrder) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    if (splitPaymentIdwiseOrderList.length == index + 1) {
                                        cb()
                                    }
                                }
                            })
                        })
                    }
                    else {
                        cb()
                    }
                },
                function (cb) {
                    if (splitPaymentIdwiseOrderList.length > 0) {
                        splitPaymentIdwiseOrderList.map((orderDetailsData, index) => {
                            let userName = akahuUsers.filter((y) => y.id == orderDetailsData.userId)[0].preferred_name;
                            let historyObject = {
                                splitPaymentId: req.query.splitPaymentId,
                                createdBy: req.payload.id,
                                message: "<strong>" + req.payload.preferred_name + " </strong> has remove the user " + userName + " on this split payment."
                            }
                            splitPaymentHistoryModel.create(historyObject, (err, createPaymentTransaction) => {
                                if (err) {
                                    console.log(err)
                                    cb(AppCode.Fail);
                                } else {
                                    if (splitPaymentIdwiseOrderList.length == index + 1) {
                                        cb()
                                    }
                                }
                            });
                        })
                    }
                    else {
                        cb()
                    }
                }
            ],
            function (err, data) {
                if (err) {
                    console.log(err);
                    response.setError(err);
                    response.send(res);
                }
                else {
                    response.setData(AppCode.Success, data);
                    response.send(res);
                }
            }
        )
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Split Payment Transaction" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

module.exports = splitPaymentTransactionCtrl;