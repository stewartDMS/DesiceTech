let exchangeTokenCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query, response } = require("express");
const _ = require("lodash");
const fs = require("fs");
const https = require('https');

const akahuUserModel = new (require("../../../common/model/akahu-details/akahuUserModel"))();
const akahuAccountModel = new (require("../../../common/model/akahu-details/akahuAccountModel"))();
const webhookModel = new (require("../../../common/model/webhookModel"))();
const paymentTransactionModel = new (require("../../../common/model/split-payment/paymentTransactionModel"))();
const splitPaymentCategoryModel = new (require("../../../common/model/split-payment/splitPaymentCategoryModel"))();


const { AkahuClient } = require('akahu');

const crypto = require('crypto');

// local credential - development
// const appToken = 'app_token_clpu6ruwg000108kx8j0ldurc';
// const appSecret = '7598a85e5b371ac0b4b4e00d0e3d70b39a6d0a8ac7b3eae990461fc6f0e8d6d1';

//live credential - production
const appToken = 'app_token_clswintdk000008l5di0dbxvp';
const appSecret = '449f5e4dfa6abcc8aafdda08924ba6316a38c1556917d57b114f4748fd247115';

const akahu = new AkahuClient({ appToken: appToken, appSecret: appSecret });
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

exchangeTokenCtrl.tokenExchangeCallback = async (req, res) => {
    var response = new HttpRespose()
    console.log(req.query);

    // const akahuOAuthRedirectUri = "http://localhost:3001/v1/token/shared/callback";
    // const akahuOAuthRedirectUri = "http://decisedevelopment.vidhaninfotech.com/v1/token/shared/callback";
    const akahuOAuthRedirectUri = "https://desice.tech/v1/token/shared/callback";
    // const akahuOAuthRedirectUri = process.env.AKAHU_CALLBACK_URL;    

    try {
        const tokenResponse = await akahu.auth.exchange(req.query.code, akahuOAuthRedirectUri);
        const { access_token } = tokenResponse;

        const data = await akahu.users.get(access_token);
        console.log("user data", data);
        const userResponse = await userCreateUpdate(access_token, data);
        console.log("user data created ", userResponse);
        if (userResponse.isCreate) {
            const accountDetails = await akahu.accounts.list(access_token);
            console.log("accountDetails ", accountDetails);
            const storeAccountDetails = await userAccountDetailsStore(userResponse.data.id, accountDetails, access_token);
            console.log("storeAccountDetails ", storeAccountDetails);
        }

        const transactionDetails = await getTransaction(access_token, userResponse.data.id);
        console.log("transactionDetails", transactionDetails);

        const setupAccountWebhooks = await setupAccountWebhook(access_token);
        const setupTransactionWebhooks = await setupTransactionWebhook(access_token);
        const setupTRANSFERWebhooks = await setupTRANSFERWebhook(access_token);
        const setupPAYMENTWebhooks = await setupPAYMENTWebhook(access_token);

        if (!userResponse.isRight) {
            response.setError(AppCode.Fail);
            response.send(res);
        }
        else {
            akahuUserModel.generateSessionToken({ id: userResponse.data.id }, function (err, userResData) {
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


                    console.log({
                        message: 'Akahu Connected Successfully',
                        code: 200,
                    });
                    console.log(userResData)

                    response.setData({
                        message: 'Akahu Connected Successfully',
                        code: 200,
                        // }, userResData);
                    }, akahuUserModel.encryptObject(userResData));
                    response.send(res);
                }
            }
            );
        }

    } catch (error) {
        console.log(error.message);
        errorLogModel.create({ errorMessage: exception.message, tableName: "Exchange-Token" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }

};

// user create and update functionality
const userCreateUpdate = (access_token, userData) => {
    let query = {
        akahuUserId: akahuUserModel.encrypt(userData._id)
    };

    return new Promise((resolve, reject) => {
        akahuUserModel.findByAttribute(query, (err, akahuUserData) => {
            if (err) {
                reject({ isRight: false });
            } else if (_.isEmpty(akahuUserData)) {
                let createObj = {
                    akahuUserId: akahuUserModel.encrypt(userData._id),
                    first_name: userData.first_name ? userData.first_name : "",
                    last_name: userData.last_name ? userData.last_name : "",
                    preferred_name: userData.preferred_name ? userData.preferred_name : "",
                    mobile: userData.mobile ? userData.mobile : "",
                    email: userData.email ? userData.email : "",
                    mpin: "",
                    profile_picture: "",
                    access_token: akahuUserModel.encrypt(access_token),
                    access_granted_at: new Date(userData.access_granted_at).toISOString(),
                    autoPayment: false
                };

                akahuUserModel.create(createObj, (err, create) => {
                    if (err) {
                        console.log(err)
                        reject({ isRight: false });
                    } else {
                        resolve({ isRight: true, isCreate: true, data: create });
                    }
                });
            } else {
                let updateObj = {
                    access_token: akahuUserModel.encrypt(access_token),
                    access_granted_at: new Date(userData.access_granted_at).toISOString()
                };
                akahuUserModel.updateData({ id: akahuUserData.id }, updateObj, (err, update) => {
                    if (err || (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0))) {
                        console.log(err || "No documents matched the update query");
                        reject({ isRight: false });
                    } else {
                        akahuUserModel.findByAttribute({ akahuUserId: akahuUserModel.encrypt(userData._id) }, (err, akahuUserData) => {
                            if (err) {
                                console.log(err);
                                reject({ isRight: false });
                            }
                            else {
                                resolve({ isRight: true, isCreate: false, data: akahuUserData });
                            }
                        })
                    }
                });
            }
        });
    });
};

// user account details store 
const userAccountDetailsStore = (akahuUserId, accountList, access_token) => {

    let accountListData = [];

    accountList.map(async (x, index) => {

        let akahuAccountObj = {
            "_id": x._id,
            "_credentials": x?._credentials,
            "name": x?.name,
            "status": x?.status,
            "balance": {
                "currency": x?.balance?.currency,
                "current": x?.balance?.current,
                "available": x?.balance?.available,
                "limit": x?.balance?.limit,
                "overdrawn": x?.balance?.overdrawn
            },
            "type": x?.type,
            "attributes": x?.attributes,
            "formatted_account": x?.formatted_account,
            "holder": x?.meta?.holder,
            "loan_details": x?.meta?.loan_details,
        }

        let accountObj = {
            "akahuUserId": akahuUserId,
            "setAsPrimary": index == 0 ? true : false,
            "accountData": akahuAccountModel.encryptObject(akahuAccountObj),
            "status": 1
        }

        // let webhookObj = {
        //     "webhook_type": "ACCOUNT",
        //     "webhook_code": "CREATE",
        //     "state": "create account",
        // }
        // let paymentStatusUpdate = await akahu.webhooks.subscribe(access_token, webhookObj);

        accountListData.push(accountObj)
    })

    return new Promise((resolve, reject) => {
        akahuAccountModel.createMany(accountListData, (err, create) => {
            if (err) {
                console.log(err)
                reject({ isRight: false });
            } else {
                resolve(create);
            }
        });
    });
};

const setupAccountWebhook = async (access_token) => {
    return new Promise(async (resolve, reject) => {
        try {
            let obj = {
                "webhook_type": "ACCOUNT",
                "state": "get Account data",
            }
            let paymentStatusUpdate = await akahu.webhooks.subscribe(access_token, obj);
            resolve(paymentStatusUpdate);
        } catch (error) {
            reject(error);
        }
    })
};

const setupTransactionWebhook = async (access_token) => {
    return new Promise(async (resolve, reject) => {
        try {
            let obj = {
                "webhook_type": "TRANSACTION",
                "state": "get transaction data",
            }
            let paymentStatusUpdate = await akahu.webhooks.subscribe(access_token, obj);
            resolve(paymentStatusUpdate);
        } catch (error) {
            reject(error);
        }
    })
};

const setupTRANSFERWebhook = async (access_token) => {
    return new Promise(async (resolve, reject) => {
        try {
            let obj = {
                "webhook_type": "TRANSFER",
                "state": "get TRANSFER data",
            }
            let paymentStatusUpdate = await akahu.webhooks.subscribe(access_token, obj);
            resolve(paymentStatusUpdate);
        } catch (error) {
            reject(error);
        }
    })
};

const setupPAYMENTWebhook = async (access_token) => {
    return new Promise(async (resolve, reject) => {
        try {
            let obj = {
                "webhook_type": "PAYMENT",
                "state": "get PAYMENT data",
            }
            let paymentStatusUpdate = await akahu.webhooks.subscribe(access_token, obj);
            resolve(paymentStatusUpdate);
        } catch (error) {
            reject(error);
        }
    })
};



// create secreat key 
exchangeTokenCtrl.cratesecretKey = async (req, res) => {
    // var response = new HttpRespose();
    // function generateSecretKey(password, salt, iterations, keyLength) {
    //     return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
    // }

    // // Example usage
    // const password = 'DeciseDevelopment@NZ123Land';
    // const salt = crypto.randomBytes(32); // Generate a random salt
    // const iterations = 100000; // Adjust the number of iterations based on your security requirements
    // const keyLength = 16; // 32 bytes for aes-256 encryption

    // const secretKey = generateSecretKey(password, salt, iterations, keyLength);

    // response.setData(AppCode.Success, secretKey.toString('hex'));
    // response.send(res);

    const response = new HttpRespose(); // Corrected the spelling mistake in 'HttpRespose'

    function generateSecretKey(password, salt, iterations, keyLength) {
        return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
    }

    // Example usage
    const password = 'DeciseDevelopment@NZ2024Land';
    const salt = crypto.randomBytes(16); // Generate a random salt
    const iterations = 100000; // Adjust the number of iterations based on your security requirements
    const keyLength = 16; // 32 bytes for aes-256 encryption

    const secretKey = generateSecretKey(password, salt, iterations, keyLength);

    response.setData(AppCode.Success, secretKey.toString('hex'));
    response.send(res);
};

// webhook setup 
exchangeTokenCtrl.webhookCallback = async (req, res) => {
    var response = new HttpRespose();

    console.log("Webhook call successfully.");
    // console.log("req headers", req.headers);

    try {
        // Extract headers and payload
        const signature = req.headers['x-akahu-signature'];
        const keyId = req.headers['x-akahu-signing-key'];

        const payload = req.body;
        console.log("payload", payload);
        // Retrieve public key
        const publicKey = await akahu.webhooks.getPublicKey(keyId);
        console.log("publicKey", publicKey);

        const validate = akahu.webhooks.validateWebhook(keyId, signature, payload)

        console.log("validate", validate);

        if (validate) {
            console.log("Valid Akahu webhook!");
            if (payload.webhook_code == "WEBHOOK_CANCELLED") {
                akahuUserModel.update({ id: req.payload.id }, { access_token: null }, (err, response) => {
                    if (err) {
                        response.setError({ code: 1010, message: err.message });
                        response.send(res);
                    }
                    else {
                        response.setData(AppCode.Success);
                        response.send(res)
                    }
                })
            }

            if (payload.webhook_type == "TRANSACTION") {

            }

            // if (payload.webhook_type == "ACCOUNT") {
            //     akahuAccountModel.get(async (err, accountDetails) => {
            //         if (err) {
            //             response.setError({ code: 1010, message: err.message });
            //             response.send(res);
            //         }
            //         else {
            //             accountDetails.map(x => {
            //                 x.accountData = akahuAccountModel.decryptObject(x.accountData)
            //             })

            //             let accountDetails = await akahu.accounts.get()

            //             let checkAccount = accountDetails.filter(x => x.accountData._id == payload.item_id);
            //             if (checkAccount.length > 0) {

            //             }
            //             else {
            //                 let akahuAccountObj = {
            //                     "_id": x._id,
            //                     "_credentials": x?._credentials,
            //                     "name": x?.name,
            //                     "status": x?.status,
            //                     "balance": {
            //                         "currency": x?.balance?.currency,
            //                         "current": x?.balance?.current,
            //                         "available": x?.balance?.available,
            //                         "limit": x?.balance?.limit,
            //                         "overdrawn": x?.balance?.overdrawn
            //                     },
            //                     "type": x?.type,
            //                     "attributes": x?.attributes,
            //                     "formatted_account": x?.formatted_account,
            //                     "holder": x?.meta?.holder,
            //                     "loan_details": x?.meta?.loan_details,
            //                 }

            //                 let accountObj = {
            //                     "akahuUserId": akahuUserId,
            //                     "setAsPrimary": index == 0 ? true : false,
            //                     "accountData": akahuAccountModel.encryptObject(akahuAccountObj),
            //                     "status": 1
            //                 }

            //             }
            //         }
            //     })
            // }

            // Process the validated webhook payload here
            res.status(200).send("Webhook received and validated successfully");
        } else {
            console.error("Invalid signature! Potential security threat.");
            res.status(403).send("Invalid signature");
        }
    } catch (error) {
        console.error("Error validating webhook:", error);
        res.status(500).send("Error processing webhook");
    }
};

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


exchangeTokenCtrl.getWebhooks = async (req, res) => {
    var response = new HttpRespose();

    try {
        let oldTransactionListData = await oldTransactionList();
        let categoryListData = await categoryList();
        let webhook = await akahu.transactions.list(req.payload.access_token);
        let transactionList = [];
        webhook.items.map((x) => {
            // let checkId = oldTransactionListData.filter(y => y.trans_id == x._id);
            // if (checkId.length == 0) {
            let receiverNameData = '';

            if (!!x.merchant) {
                receiverNameData = x.merchant.name
            }
            else {
                receiverNameData = 'Other'
            }

            let categoriesData = ''
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
                userId: req.payload.id,
                categoryId: categoriesData,
                type: x.type == "PAYMENT" || x.type == "TRANSFER" ? (x.amount > 0 ? 'CREDIT' : 'DEBIT') : x.type,
                status: x.type == "PAYMENT" || x.type == "TRANSFER" ? (x.amount > 0 ? 'CREDIT' : 'DEBIT') : x.type,
                receiverName: receiverNameData,
                connectionName: '',
                isAuto: 3,
                createdAt: typeof (x.created_at) == 'string' ? new Date(x.created_at).toISOString() : null
            }
            transactionList.push(obj)
            //     }
        })
        response.setData(AppCode.Success, webhook);
        response.send(res);
        if (transactionList.length > 0) {
            // paymentTransactionModel.createMany(transactionList, async (err, paymentTransactionCreate) => {
            //     if (err) {
            //         console.log(err.message);
            //         response.setError(AppCode.Fail);
            //         response.send(res);
            //     }
            //     else {
            //         response.setData(AppCode.Success, paymentTransactionCreate);
            //         response.send(res);
            //     }
            // })
        }
        else {
            response.setError(AppCode.NotFound);
            response.send(res);
        }
    } catch (error) {
        response.setError({ code: 1010, message: error.message });
        response.send(res);
    }
};

// const getTransaction = async (token, userId) => {
//     return new Promise(async (resolve, reject) => {
//         try {

//             let oldTransactionListData = await oldTransactionList();

//             let transactionList = [];
//             let webhook = await akahu.transactions.list(token);
//             let categoryListData = await categoryList();
//             console.log("webhook.length", webhook.items.length);
//             if (webhook.items.length > 0) {
//                 webhook.items.map((x) => {
//                     let checkId = oldTransactionListData.filter(y => y.trans_id == x._id);
//                     if (checkId.length == 0) {
//                         let receiverNameData = '';
//                         if (x.type == "PAYMENT" && x.amount < 0) {
//                             receiverNameData = x.meta.other_account;
//                         }
//                         else if (x.type == "TRANSFER") {
//                             receiverNameData = "Other"
//                         }
//                         else if (x.type == "EFTPOS") {
//                             if (!!x.merchant) {
//                                 receiverNameData = x.merchant.name
//                             }
//                         }
//                         else if (x.type == "DEBIT") {
//                             if (!!x.merchant) {
//                                 receiverNameData = x.merchant.name
//                             }
//                         }
//                         else if (x.type == "CREDIT") {
//                             if (!!x.meta) {
//                                 receiverNameData = Object.values(x.meta)[0];
//                             }
//                         }
//                         else {
//                             receiverNameData = x.type
//                         }
//                         let categoriesData = ''
//                         if (x.category) {

//                             categoryListData.filter((cat) => {
//                                 if (x.category._id == "nzfcc_cl15vdeg8000009l32o2v1ory" || x.category._id == "nzfcc_cl2pae1ns000009jt55t2cdir") {
//                                     categoriesData = "1707830735251913348979" // debpts category id
//                                 }
//                                 else if (x.category._id == "nzfcc_ckouvvzc2006208ml5mg1cxf7") {
//                                     categoriesData = "1705060914460864461096" // investment id
//                                 }
//                                 else if (x.category._id == "nzfcc_cl2pgeu3q000109i4368cg786") {
//                                     categoriesData = "1705061018964666292093" // saving category id
//                                 }
//                                 else if (cat.akahuGroupId == x.category.groups.personal_finance._id) {
//                                     categoriesData = cat.id // merchant group id
//                                 }
//                             })
//                             if (!categoriesData) {
//                                 categoriesData = "1709624800694928995635" // other category id
//                             }

//                             // let matchCategory = categoryListData.filter(cat => cat.akahuGroupId == x.category.groups.personal_finance._id)
//                             // if (matchCategory.length > 0) {
//                             //     categoriesData = matchCategory[0].id
//                             // }
//                             // else {
//                             //     categoriesData = "1709624800694928995635"
//                             // }
//                         }
//                         else {
//                             categoriesData = "1709624800694928995635"
//                         }

//                         let obj = {
//                             trans_id: x._id,
//                             description: x.description,
//                             netAmount: x.amount,
//                             amount: x.amount,
//                             platformFees: 0,
//                             userId: userId,
//                             categoryId: categoriesData,
//                             type: x.type == "PAYMENT" || x.type == "TRANSFER" ? (x.amount > 0 ? 'CREDIT' : 'DEBIT') : x.type,
//                             status: x.type == "PAYMENT" || x.type == "TRANSFER" ? (x.amount > 0 ? 'CREDIT' : 'DEBIT') : '',
//                             receiverName: receiverNameData,
//                             connectionName: '',
//                             isAuto: 3,
//                             createdAt: typeof (x.created_at) == 'string' ? new Date(x.created_at).toISOString() : null
//                         }
//                         transactionList.push(obj)
//                     }
//                 })

//                 if (transactionList.length > 0) {
//                     paymentTransactionModel.createMany(transactionList, async (err, paymentTransactionCreate) => {
//                         if (err) {
//                             reject(AppCode.Fail);
//                         }
//                         else {
//                             resolve();
//                         }
//                     })
//                 }
//                 else {
//                     resolve();
//                 }
//             }
//             else {
//                 resolve();
//             }
//         } catch (error) {
//             reject(error);
//         }
//     })
// };
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

                        let categoriesData = ''
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



module.exports = exchangeTokenCtrl;