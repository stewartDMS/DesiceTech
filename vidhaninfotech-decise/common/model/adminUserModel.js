const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const saltRounds = 10;
const AppCode = require("../constant/appCods");

class adminUserModel extends ModelBase {
    constructor() {
        super("Admin-User", 6, {
            firstName: { type: String, allowNullEmpty: false },
            lastName: { type: String, allowNullEmpty: false },
            role: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "Super Admin", 2: "Admin", 3: 'Other' }
            },
            email: { type: String, allowNullEmpty: false },
            password: { type: String, allowNullEmpty: false },
            jti: { type: String, allowNullEmpty: true },
            tokenId: { type: String, allowNullEmpty: true },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "active", 2: "inactive" }
            },
        });
    }

    /**
     * @description create Always return an unique id after inserting new user
     * @param {*} data
     * @param {*} cb
     */

    create(data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        var self = this;
        data.createdAt = new Date().toISOString();
        data.status = 1;
        data.jti = "";
        data.tokenId = "";

        bcrypt.hash(data.password, saltRounds, function (encryptErr, hash) {
            if (encryptErr) {
                return cb(encryptErr);
            }
            data.password = hash;

            self.insert(data, function (err, user) {
                if (err) {
                    return cb(err);
                }
                delete user.password;

                cb(null, user);
            });
        });
    }

    update(query, data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.updatedAt = new Date().toISOString();
        var self = this;

        self.updateData(query, data, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

    updateForgotPassword(query, data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.updatedAt = new Date().toISOString();
        var self = this;

        bcrypt.hash(data.password, saltRounds, function (encryptErr, hash) {
            if (encryptErr) {
                return cb(encryptErr);
            }
            data.password = hash;

            self.updateData(query, data, function (err, result) {
                if (err) {
                    return cb(err);
                }
                delete result.password;

                cb(null, result);
            });
        });
    }

    async findOneByEmail(email, cb) {
        const params = {
            TableName: this.tableName,
            FilterExpression: "#email = :email",
            ExpressionAttributeNames: {
                "#email": "email",
            },
            ExpressionAttributeValues: {
                ":email": email,
            },
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items[0]);

        } catch (error) {
            cb(error);
        }
    }

    generateSessionToken(paramsObj, callback) {
        var self = this;
        if (!!paramsObj && paramsObj.id) {

            let query = {
                id: paramsObj.id
            }


            self.findOne(query, function (err, user) {
                if (err) {
                    callback(AppCode.InternalServerError);
                } else {
                    if (user === null || user === undefined) {
                        callback(AppCode.NoUserFound);
                    } else {
                        user = user;
                        let tokenData = {};
                        tokenData.firstName = user.firstName;
                        tokenData.lastName = user.lastName;
                        tokenData.email = user.email;
                        tokenData.id = user.id;
                        tokenData.role = user.role;

                        user.jti = user.id + "_" + randToken.generator({ chars: '0-9' }).generate(6);
                        tokenData.jti = user.id + "_" + randToken.generator({ chars: '0-9' }).generate(6);
                        user.myToken = jwt.sign(tokenData, CONFIG.JWTTOKENKEY, {
                            expiresIn: '30d' //365 days
                        });

                        let deviceTokenInfo = {};

                        deviceTokenInfo.tokenId = user.myToken;
                        deviceTokenInfo.jti = user.jti;

                        delete user.password

                        if (!!deviceTokenInfo) {
                            self.update({ id: paramsObj.id }, { tokenId: deviceTokenInfo.tokenId, jti: deviceTokenInfo.jti }, function (err, UpdatedMasterUser) {
                                if (err) {
                                    console.log(err)
                                    callback(AppCode.SomethingWrong);
                                } else {
                                    delete user.deviceTokens
                                    callback(null, user);
                                }
                            });
                        } else {
                            callback(AppCode.MissingDeviceTokenParameter);
                        }
                    }
                }
            });
        } else {
            callback(AppCode.SomethingWrong);
        }
    }

}

module.exports = adminUserModel;