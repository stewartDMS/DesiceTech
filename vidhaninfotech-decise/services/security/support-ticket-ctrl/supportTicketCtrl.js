let supportTicketCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");
const firebaseToken = require("firebase-admin");

const deviceTokenModel = new (require("../../../common/model/deviceTokenModel"))();
const adminUserModel = new (require("../../../common/model/adminUserModel"))();
const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const supportTicketModel = new (require("../../../common/model/support-ticket/supportTicketModel"))();
const supportTicketTransactionModel = new (require("../../../common/model/support-ticket/supportTicketTransactionModel"))();
const supportTicketCategoryModel = new (require("../../../common/model/support-ticket/supportTicketCategoryModel"))();
const notificationModel = new (require("../../../common/model/notificationModel"))();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
    region: CONFIG.AWS.REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


supportTicketCtrl.ticketCreate = async (req, res) => {
    var response = new HttpRespose();
    var data = req.body;


    // create code here
    var ticketBodyObj = {};

    ticketBodyObj.userID = req.payload.id;
    ticketBodyObj.categoryID = data.categoryID;
    ticketBodyObj.priority = parseInt(data.priority);
    ticketBodyObj.subject = data.subject;
    ticketBodyObj.createdBy = req.payload.id;

    supportTicketModel.create(ticketBodyObj, (err, ticketCreate) => {
        if (err) {
            console.log(err)
            response.setError(AppCode.Fail);
            response.send(res);
        } else {

            akahuUserModel.findOne({ id: ticketCreate.createdBy }, (err, getData) => {
                if (err) {
                    console.log(err)
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else if (_.isEmpty(getData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                } else {

                    let transactionObj = {};

                    transactionObj.ticketID = ticketCreate.id;
                    transactionObj.description = data.description;

                    // if (req.files.supportTicketFile && req.files.supportTicketFile.length > 0) {

                    //     req.files.supportTicketFile.map(x => {
                    //         transactionObj.files = [];
                    //         transactionObj.files.push({
                    //             fileName: x.key,
                    //             fileExtention: x.mimetype.split('/')[1],
                    //             fileSize: x.size,
                    //             filePath: x.location
                    //         })
                    //     })
                    // }
                    // else {
                    //     transactionObj.files = null
                    // }

                    if (parseInt(req.query.isMobile) == 0) {
                        console.log("support ticket file", data.supportTicketFile);
                        if (!!data.supportTicketFile) {
                            data.supportTicketFile = data.supportTicketFile;
                            transactionObj.files = [];
                            transactionObj.files.push({
                                fileName: data.supportTicketFile.split(".com/")[1],
                                fileExtention: data.supportTicketFile,
                                fileSize: data.supportTicketFile,
                                filePath: data.supportTicketFile
                            })
                        }
                    }
                    else {
                        data.supportTicketFile = data.supportTicketFile.split(",")
                        if (data.supportTicketFile && data.supportTicketFile.length > 0) {
                            transactionObj.files = [];
                            data.supportTicketFile.map(x => {
                                transactionObj.files.push({
                                    fileName: x.split(".com/")[1],
                                    fileExtention: x,
                                    fileSize: x,
                                    filePath: x
                                })
                            })
                        }
                    }

                    transactionObj.createdBy = req.payload.id;
                    transactionObj.createdByName = getData.preferred_name;
                    transactionObj.isSendByAdminSupport = 0;

                    supportTicketTransactionModel.create(transactionObj, (err, transactionCreate) => {
                        if (err) {
                            console.log(err)
                            response.setError(AppCode.Fail);
                            response.send(res);
                        } else {
                            adminUserModel.get((err, getAdminList) => {
                                if (err) {
                                    console.log(err)
                                    response.setError(AppCode.Fail);
                                    response.send(res);
                                }
                                else if (_.isEmpty(getAdminList)) {
                                    response.setError(AppCode.NotFound);
                                    response.send(res);
                                }
                                else {

                                    let notificationList = [];
                                    getAdminList.map(x => {
                                        let notificationObj = {
                                            senderId: req.payload.id,
                                            receiverId: x.id,
                                            msg: getData.preferred_name + ' created issue is ' + ticketCreate.subject,
                                            type: 1,
                                        };
                                        notificationList.push(notificationObj)
                                    })

                                    notificationModel.createMany(notificationList, (err, notificationData) => {
                                        if (err) {
                                            console.log(err)
                                            response.setError(AppCode.Fail);
                                            response.send(res);
                                        } else {

                                            // notificationData.map((x, index) => {
                                            //     x.senderName = req.payload.firstName + " " + req.payload.lastName;
                                            //     let socketData = {
                                            //         notification: x,
                                            //         assignPersons: x.receiverId.toString()
                                            //     }
                                            //     SocketEmitter.notification.emit(socketData);

                                            //     if (notificationData.length == index + 1) {
                                            //         response.setData(AppCode.Success, leaveCreate);
                                            //         response.send(res);
                                            //     }

                                            // })

                                            response.setData(AppCode.supportTicketCreate, ticketCreate);
                                            response.send(res);
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            })
        }
    });
};

supportTicketCtrl.ticketReply = (req, res) => {
    var response = new HttpRespose();
    var data = req.body;

    supportTicketModel.findOne({ id: data.ticketID }, (err, ticketData) => {
        if (err) {
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (_.isEmpty(ticketData)) {
            response.setError(AppCode.NotFound);
            response.send(res);
        } else {

            let model;
            if (parseInt(req.query.isMobile) == 0) {
                model = akahuUserModel
            }
            else {
                model = adminUserModel
            }

            model.findOne({ id: req.payload.id }, (err, getData) => {
                if (err) {
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else if (_.isEmpty(getData)) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                } else {

                    let transactionObj = {};
                    transactionObj.ticketID = data.ticketID;
                    transactionObj.description = data.description;

                    if (req.files.supportTicketFile && req.files.supportTicketFile.length > 0) {
                        transactionObj.files = [];
                        req.files.supportTicketFile.map(x => {
                            transactionObj.files.push({
                                fileName: x.key,
                                fileExtention: x.mimetype.split('/')[1],
                                fileSize: x.size,
                                filePath: x.location
                            })
                        })
                    }
                    else {
                        transactionObj.files = null
                    }

                    if (parseInt(req.query.isMobile) == 0) {
                        if (!!data.supportTicketFile) {
                            data.supportTicketFile = data.supportTicketFile;
                            transactionObj.files = [];
                            transactionObj.files.push({
                                fileName: data.supportTicketFile.split(".com/")[1],
                                fileExtention: data.supportTicketFile,
                                fileSize: data.supportTicketFile,
                                filePath: data.supportTicketFile
                            })
                        }
                    }
                    else {
                        data.supportTicketFile = data.supportTicketFile.split(",")
                        if (data.supportTicketFile && data.supportTicketFile.length > 0) {
                            transactionObj.files = [];
                            data.supportTicketFile.map(x => {
                                transactionObj.files.push({
                                    fileName: x.split(".com/")[1],
                                    fileExtention: x,
                                    fileSize: x,
                                    filePath: x
                                })
                            })
                        }
                    }


                    transactionObj.createdBy = req.payload.id;
                    transactionObj.createdByName = parseInt(req.query.isMobile) == 0 ? getData.preferred_name : (getData.firstName + ' ' + getData.lastName);
                    transactionObj.isSendByAdminSupport = parseInt(req.query.isMobile);

                    supportTicketTransactionModel.create(transactionObj, (err, transactionCreate) => {
                        if (err) {
                            console.log(err)
                            response.setError(AppCode.Fail);
                            response.send(res);
                        } else {

                            if (parseInt(req.query.isMobile) == 0) {
                                adminUserModel.get((err, getAdminList) => {
                                    if (err) {
                                        response.setError(AppCode.Fail);
                                        response.send(res);
                                    }
                                    else if (_.isEmpty(getAdminList)) {
                                        response.setError(AppCode.NotFound);
                                        response.send(res);
                                    }
                                    else {
                                        const msg = getData.preferred_name + ' reply of the ticket is : ' + data.description;

                                        let notificationList = [];
                                        getAdminList.map(x => {
                                            let notificationObj = {
                                                senderId: req.payload.id,
                                                receiverId: x.id,
                                                msg: msg,
                                                type: parseInt(req.query.isMobile) == 0 ? 3 : 2,
                                            };
                                            notificationList.push(notificationObj)
                                        })

                                        notificationModel.createMany(notificationList, (err, notificationData) => {
                                            if (err) {
                                                console.log(err)
                                                response.setError(AppCode.Fail);
                                                response.send(res);
                                            } else {
                                                response.setData(AppCode.Success, transactionCreate);
                                                response.send(res);
                                            }
                                        })
                                    }
                                })


                            }
                            else {
                                const msg = (getData.firstName + ' ' + getData.lastName) + ' reply your ticket is : ' + data.description;
                                let notificationObj = {
                                    senderId: req.payload.id,
                                    receiverId: ticketData.userID,
                                    msg: msg,
                                    supportTicketId: data.ticketID,
                                    type: parseInt(req.query.isMobile) == 0 ? 3 : 2,
                                };
                                notificationModel.create(notificationObj, (err, notificationData) => {
                                    if (err) {
                                        console.log(err)
                                        response.setError(AppCode.Fail);
                                        response.send(res);
                                    } else {
                                        response.setData(AppCode.Success);
                                        response.send(res);
                                        // deviceTokenModel.findByAttribute({ akahuUserId: notificationData.receiverId }, (err, tokenData) => {
                                        //     if (err) {
                                        //         response.setError(AppCode.Fail);
                                        //         response.send(res);
                                        //     }
                                        //     else if (_.isEmpty(tokenData)) {
                                        //         response.setError(AppCode.NotFound);
                                        //         response.send(res);
                                        //     }
                                        //     else {
                                        //         sendAdminToTopics(
                                        //             notificationData.msg,
                                        //             "Reply your ticket",
                                        //             notificationData.senderId,
                                        //             req.payload.firstName + " " + req.payload.lastName,
                                        //             notificationData.type,
                                        //             tokenData.deviceToken,
                                        //             data.ticketID,
                                        //             notificationData.createdAt.toString(),
                                        //             notificationData.id,
                                        //             res
                                        //         )
                                        //     }
                                        // })
                                    }
                                })
                            }
                        }
                    });
                }
            })
        }
    })
};

supportTicketCtrl.closeSupportTicket = (req, res) => {
    var response = new HttpRespose()
    // update code here
    supportTicketModel.findOne({ id: req.query.id }, (err, getData) => {
        if (err) {
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (_.isEmpty(getData)) {
            response.setError(AppCode.NotFound);
            response.send(res);
        } else {
            // update code
            supportTicketModel.update({ id: req.query.id }, { status: 2, updatedBy: req.payload.id }, function (err, update) {
                if (err) {
                    console.log(err)
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                    response.setError(AppCode.NotFound);
                } else {
                    response.setData(AppCode.supportTicketClosed);
                    response.send(res);
                }
            });
        }
    })
};

supportTicketCtrl.uploadTicketFile = (req, res) => {
    var response = new HttpRespose();

    const command = new PutObjectCommand({
        Bucket: 'desice-uploaded-files',
        Key: req.query.fileName,
        ContentType: req.query.fileType
    });

    getSignedUrl(s3, command, { expiresIn: 3600 }).then(url => {
        response.setData(AppCode.Success, url);
        response.send(res);
    }).catch(err => {
        response.setError(AppCode.Fail);
        response.send(res);
    });
};

supportTicketCtrl.getTicketDataForAdmin = async (req, res) => {
    var response = new HttpRespose()
    const ticketID = req.query.ticketID;

    if (ticketID && ticketID != 'null') {
        supportTicketModel.findOne({ id: req.query.ticketID }, (err, ticketData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(ticketData) || _.isNull(ticketData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                let categoryList = [];
                let ticketTransactionList = [];

                async.waterfall(
                    [
                        function (cb) {
                            supportTicketCategoryModel.get((err, categoryData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    categoryList = categoryData;
                                    cb()
                                }
                            })
                        },
                        function (cb) {
                            supportTicketTransactionModel.aggregate({ ticketID: ticketData.id }, (err, transactionData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    ticketTransactionList = transactionData;
                                    cb()
                                }
                            })
                        },
                        function (cb) {

                            let ticketObj = {
                                id: ticketData.id,
                                userID: ticketData.userID,
                                createdAt: ticketData.createdAt,
                                categoryID: ticketData.categoryID,
                                categoryName: categoryList.filter(x => x.id == ticketData.categoryID)[0].name,
                                status: ticketData.status == 1 ? 'Created' : 'Closed',
                                subject: ticketData.subject,
                                priority: ticketData.priority == 1 ? 'Normal' : ticketData.priority == 2 ? 'High' : ticketData.priority == 3 ? 'Urgent' : ticketData.priority == 4 ? 'Emergency' : '',
                                repliedData: ticketTransactionList.sort((a, b) => supportTicketModel.sortAccendingDate(a.createdAt, b.createdAt))
                            }

                            cb(null, ticketObj);
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(err);
                            response.send(res)
                        }
                        else {
                            response.setData(AppCode.Success, data);
                            response.send(res)
                        }
                    }
                )
            }
        });
    }
    else {
        supportTicketModel.aggregate({ status: 1 }, (err, ticketData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(ticketData) || _.isNull(ticketData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                let categoryList = [];
                let akahuUserList = [];

                async.waterfall(
                    [
                        function (cb) {
                            supportTicketCategoryModel.get((err, categoryData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    categoryList = categoryData;
                                    cb()
                                }
                            })
                        },
                        function (cb) {
                            akahuUserModel.get((err, userData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    akahuUserList = userData;
                                    cb()
                                }
                            })
                        },
                        function (cb) {
                            let ticektList = [];

                            ticketData.map((item, index) => {

                                let ticketObj = {
                                    id: item.id,
                                    userID: item.userID,
                                    userName: akahuUserList.filter(x => x.id == item.userID)[0].preferred_name,
                                    createdAt: item.createdAt,
                                    categoryID: item.categoryID,
                                    categoryName: categoryList.filter(x => x.id == item.categoryID)[0].name,
                                    status: item.status == 1 ? 'Created' : 'Closed',
                                    subject: item.subject,
                                    priority: item.priority == 1 ? 'Normal' : item.priority == 2 ? 'High' : item.priority == 3 ? 'Urgent' : item.priority == 4 ? 'Emergency' : ''
                                }
                                ticektList.push(ticketObj);

                                if (ticketData.length == index + 1) {
                                    cb(null, ticektList)
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
                            response.send(res)
                        }
                    }
                )
            }
        });
    }
};

supportTicketCtrl.getTicketDataForMobile = async (req, res) => {
    var response = new HttpRespose()
    let query = [];
    const ticketID = req.query.ticketID;

    if (ticketID && ticketID != 'null') {
        supportTicketModel.findByMultipleAttribute({ id: req.query.ticketID, userID: req.payload.id }, (err, ticketData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(ticketData) || _.isNull(ticketData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                let categoryList = [];
                let ticketTransactionList = [];

                async.waterfall(
                    [
                        function (cb) {
                            supportTicketCategoryModel.get((err, categoryData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    categoryList = categoryData;
                                    cb()
                                }
                            })
                        },
                        function (cb) {
                            supportTicketTransactionModel.aggregate({ ticketID: ticketData.id }, (err, transactionData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                }
                                else {
                                    ticketTransactionList = transactionData;
                                    cb()
                                }
                            })
                        },
                        function (cb) {

                            let ticketObj = {
                                id: ticketData.id,
                                userID: ticketData.userID,
                                createdAt: ticketData.createdAt,
                                categoryID: ticketData.categoryID,
                                categoryName: categoryList.filter(x => x.id == ticketData.categoryID)[0].name,
                                status: ticketData.status == 1 ? 'Created' : 'Closed',
                                subject: ticketData.subject,
                                priority: ticketData.priority == 1 ? 'Normal' : ticketData.priority == 2 ? 'High' : ticketData.priority == 3 ? 'Urgent' : ticketData.priority == 4 ? 'Emergency' : '',
                                repliedData: ticketTransactionList.sort((a, b) => supportTicketModel.sortAccendingDate(a.createdAt, b.createdAt))
                            }

                            cb(null, ticketObj);
                        }
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(err);
                            response.send(res)
                        }
                        else {
                            response.setData(AppCode.Success, data);
                            response.send(res)
                        }
                    }
                )
            }
        });
    }
    else {
        supportTicketModel.aggregate({ userID: req.payload.id }, (err, ticketData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(ticketData) || _.isNull(ticketData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                let categoryList = [];
                let akahuUserList = [];

                async.waterfall(
                    [
                        function (cb) {
                            supportTicketCategoryModel.get((err, categoryData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                } else {
                                    categoryList = categoryData;
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            akahuUserModel.get((err, userData) => {
                                if (err) {
                                    cb(AppCode.Fail);
                                } else {
                                    akahuUserList = userData;
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            let ticektList = [];

                            ticketData.forEach((item, index) => {
                                let ticketObj = {
                                    id: item.id,
                                    userID: item.userID,
                                    userName: akahuUserList.find(x => x.id == item.userID)?.preferred_name,
                                    createdAt: item.createdAt,
                                    categoryID: item.categoryID,
                                    categoryName: categoryList.find(x => x.id == item.categoryID)?.name,
                                    status: item.status == 1 ? 'Created' : 'Closed',
                                    subject: item.subject,
                                    priority:
                                        item.priority == 1
                                            ? 'Normal'
                                            : item.priority == 2
                                                ? 'High'
                                                : item.priority == 3
                                                    ? 'Urgent'
                                                    : item.priority == 4
                                                        ? 'Emergency'
                                                        : '',
                                };
                                ticektList.push(ticketObj);

                                if (ticketData.length == index + 1) {
                                    cb(null, ticektList);
                                }
                            });
                        },
                    ],
                    function (err, data) {
                        if (err) {
                            response.setError(err);
                            response.send(res);
                        } else {
                            response.setData(AppCode.Success, data);
                            response.send(res);
                        }
                    }
                );

            }
        });
    }
};

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

module.exports = supportTicketCtrl;