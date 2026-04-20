let NotificationCtrl = {};
const notificationModel = new (require("../../../common/model/notificationModel"))();
const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const splitPaymentOrderModel = new (require("../../../common/model/split-payment/splitPaymentOrderModel"))();
const adminUserModel = new (require("../../../common/model/adminUserModel"))();
const HttpRespose = require("../../../common/httpResponse");
const AppCode = require("../../../common/constant/appCods");
const async = require("async");
const CONFIG = require("../../../config");
const Logger = require("../../../common/logger");
const _ = require("lodash");

/* notification Data Create */
NotificationCtrl.notificationDataMobile = (req, res) => {
    const response = new HttpRespose();
    if (!!req.payload) {
        let pageNumber = !!req.query.pageNumber ? req.query.pageNumber : 0;
        const limit = req.query.limit ? req.query.limit : 20;
        // let skip = limit * parseInt(pageNumber);


        let notificationList = [];
        let akahuUserList = [];
        let adminUserList = [];


        async.waterfall(
            [
                function (cb) {
                    let query = {
                        receiverId: req.payload.id,
                    }
                    notificationModel.aggregate(query, (err, data) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(data)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            notificationList = data;
                            cb()
                        }
                    })
                },
                function (cb) {
                    adminUserModel.get((err, userData) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(userData)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            adminUserList = userData;
                            cb();
                        }
                    })
                },
                function (cb) {
                    akahuUserModel.get((err, userData) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(userData)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            akahuUserList = userData;
                            cb();
                        }
                    })
                },
                function (cb) {
                    notificationList.map(x => {
                        let senderData = x.type == 2 ? (adminUserList.filter(y => y.id == x.senderId)[0]) : (akahuUserList.filter(y => y.id == x.senderId)[0]);
                        let senderName;
                        if (req.payload.access_token) {
                            senderName = x.type != 2 ? senderData.preferred_name : (senderData.firstName + " " + senderData.lastName)
                        }
                        x.senderUserName = senderName
                    })

                    notificationList = notificationList.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt));


                    // Calculate the starting index for the specified range
                    let startIndex = (pageNumber - 1) * limit;
                    let endIndex = startIndex + limit;

                    // Extract the elements for the specified range
                    let pageRecords = []
                    pageRecords = notificationList.slice(startIndex, endIndex);

                    if (_.isEmpty(pageRecords) || _.isNull(pageRecords)) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    }
                    else {
                        notificationModel.aggregateByMultipleAttribute({ receiverId: req.payload.id, isView: false }, (err, totalrecords) => {
                            if (err) {
                                response.setError(err);
                                response.send(res);
                            }
                            else {
                                totalrecords = totalrecords.length;
                                // let remainingData = totalrecords - (limit * (parseInt(pageNumber)))
                                let isLastPage = false
                                if ((limit * (parseInt(pageNumber))) >= totalrecords) {
                                    isLastPage = true
                                }
                                nextPage = parseInt(pageNumber) + 1;
                                let data = {
                                    notifications: pageRecords.sort((a, b) => notificationModel.sortDecendingDate(a.createdAt, b.createdAt)),
                                    nextPage: nextPage,
                                    isLastPage: isLastPage,
                                    count: totalrecords
                                }
                                response.setData(AppCode.Success, data)
                                response.send(res)
                            }
                        })
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
    } else {
        response.setData(AppCode.LoginAgain, {});
        response.send(res);
    }
}

NotificationCtrl.getAdminNotification = (req, res) => {
    const response = new HttpRespose();
    if (!!req.payload) {
        let pageNumber = !!req.query.pageNumber ? req.query.pageNumber : 0;
        const limit = 20;
        // let skip = limit * parseInt(pageNumber);


        let notificationList = [];
        let akahuUserList = [];
        let adminUserList = [];


        async.waterfall(
            [
                function (cb) {
                    let query = {
                        receiverId: req.payload.id,
                    }
                    notificationModel.aggregate(query, (err, data) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(data)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            notificationList = data;
                            cb()
                        }
                    })
                },
                function (cb) {
                    adminUserModel.get((err, userData) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(userData)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            adminUserList = userData;
                            cb();
                        }
                    })
                },
                function (cb) {
                    akahuUserModel.get((err, userData) => {
                        if (err) {
                            cb(err);
                        }
                        else if (_.isEmpty(userData)) {
                            cb(AppCode.NotFound);
                        }
                        else {
                            akahuUserList = userData;
                            cb();
                        }
                    })
                },
                function (cb) {
                    notificationList.map(x => {
                        let senderData = akahuUserList.filter(y => y.id == x.senderId)[0];
                        let senderName;
                        senderName = senderData.preferred_name
                        x.senderUserName = senderName
                    })

                    notificationList = notificationList.sort((a, b) => akahuUserModel.sortDecendingDate(a.createdAt, b.createdAt));


                    // Calculate the starting index for the specified range
                    let startIndex = (pageNumber - 1) * limit;
                    let endIndex = startIndex + limit;

                    // Extract the elements for the specified range
                    let pageRecords = []
                    pageRecords = notificationList.slice(startIndex, endIndex);

                    if (_.isEmpty(pageRecords) || _.isNull(pageRecords)) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    }
                    else {
                        notificationModel.aggregateByMultipleAttribute({ receiverId: req.payload.id, isView: false }, (err, totalrecords) => {
                            if (err) {
                                response.setError(err);
                                response.send(res);
                            }
                            else {
                                totalrecords = totalrecords.length;
                                let remainingData = totalrecords - (limit * pageNumber)
                                let isLastPage = false
                                if (remainingData <= limit) {
                                    isLastPage = true
                                }
                                nextPage = parseInt(pageNumber) + 1;
                                let data = {
                                    notifications: pageRecords,
                                    nextPage: nextPage,
                                    isLastPage: isLastPage,
                                    count: totalrecords
                                }
                                response.setData(AppCode.Success, data)
                                response.send(res)
                            }
                        })
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
    } else {
        response.setData(AppCode.LoginAgain, {});
        response.send(res);
    }
}

/* view Notifications */
NotificationCtrl.viewedNotifications = (req, res) => {
    const response = new HttpRespose();
    if (!!req.payload) {
        notificationModel.updateMultipleData({ receiverId: req.payload.id }, { isView: true }, (err) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } else {
        response.setData(AppCode.LoginAgain, {});
        response.send(res);
    }
}

NotificationCtrl.readNotificationsAll = (req, res) => {
    const response = new HttpRespose();
    if (!!req.payload) {
        notificationModel.updateMultipleData({ receiverId: req.payload.id }, { isRead: true }, (err) => {
            if (err) {
                throw err;
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } else {
        response.setData(AppCode.LoginAgain, {});
        response.send(res);
    }
}

/* read Notifications */
NotificationCtrl.readNotification = (req, res) => {
    const response = new HttpRespose();
    if (!!req.payload) {
        notificationModel.update({ id: req.query.id }, { isRead: true }, (err, Notifications) => {
            if (err) {
                throw err;
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } else {
        response.setData(AppCode.LoginAgain, {});
        response.send(res);
    }
}

// reminder message 
NotificationCtrl.remindNotification = (req, res) => {
    const response = new HttpRespose();
    if (!!req.payload) {

        // receiverId, paymentOrderId, splitPaymentId

        let akahuUserSenderName;
        let akahuUserReceiverName;
        let orderData;

        async.waterfall(
            [
                function (cb) {
                    akahuUserModel.findOne({ id: req.payload.id }, (err, userData) => {
                        if (err) {
                            cb(AppCode.SomethingWrong)
                        }
                        else if (_.isEmpty(userData)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            akahuUserSenderName = userData.preferred_name
                            cb();
                        }
                    })
                },
                function (cb) {
                    akahuUserModel.findOne({ id: req.query.receiverId }, (err, receiverData) => {
                        if (err) {
                            cb(AppCode.SomethingWrong)
                        }
                        else if (_.isEmpty(receiverData)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            akahuUserReceiverName = receiverData.preferred_name
                            cb();
                        }
                    })
                },
                function (cb) {
                    splitPaymentOrderModel.findOne({ id: req.query.paymentOrderId }, (err, paymentOrderData) => {
                        if (err) {
                            cb(AppCode.SomethingWrong)
                        }
                        else if (_.isEmpty(paymentOrderData)) {
                            cb(AppCode.NotFound)
                        }
                        else {
                            orderData = paymentOrderData
                            cb();
                        }
                    })
                },
                function (cb) {

                    let obj = {
                        senderId: req.payload.id,
                        receiverId: req.query.receiverId,
                        splitPaymentId: req.query.splitPaymentId,
                        msg: "You've reminder of split payment request Amount of $" + orderData.amount + " form " + akahuUserSenderName
                    }

                    notificationModel.create(obj, (err, Notifications) => {
                        if (err) {
                            throw err;
                        } else {
                            response.setData(AppCode.Success);
                            response.send(res);
                        }
                    });
                }
            ]
        )


    } else {
        response.setData(AppCode.LoginAgain, {});
        response.send(res);
    }
}


module.exports = NotificationCtrl;