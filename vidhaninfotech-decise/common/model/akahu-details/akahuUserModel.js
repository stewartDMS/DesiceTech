const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const AppCode = require("../../constant/appCods");
const saltRounds = 10;
const prisma = require("../../db/prismaClient");

class akahuUserModel extends ModelBase {
    constructor() {
        super("Akahu-Users", 15, {
            id: { type: String, allowNullEmpty: true },
            profile_picture: { type: String, allowNullEmpty: true },
            akahuUserId: { type: String, allowNullEmpty: true },
            first_name: { type: String, allowNullEmpty: true },
            last_name: { type: String, allowNullEmpty: true },
            preferred_name: { type: String, allowNullEmpty: true },
            mobile: { type: String, allowNullEmpty: true },
            email: { type: String, allowNullEmpty: true },
            mpin: { type: Number, allowNullEmpty: true },
            access_token: { type: String, allowNullEmpty: true },
            access_granted_at: { type: String, allowNullEmpty: true },
            jti: { type: String, allowNullEmpty: true },
            tokenId: { type: String, allowNullEmpty: true },
            autoPayment: { type: Boolean, allowNullEmpty: true },
            financialGoals: { type: Array, allowNullEmpty: true },
            status: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "active", 2: "inactive" }
            },
        });
    }

    create(data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.createdAt = new Date().toISOString();
        data.status = 1;
        data.jti = "";
        data.tokenId = "";
        data.mpin = "";

        this.insert(data, (err, result) => {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

    async generateSessionToken(paramsObj, callback) {
        var self = this;
        if (!!paramsObj && (paramsObj.id || paramsObj.email)) {

            self.findByAttribute(paramsObj, function (err, user) {
                if (err) {
                    callback(AppCode.InternalServerError);
                } else {
                    if (user === null || user === undefined) {
                        callback(AppCode.NoUserFound);
                    } else {
                        let tokenData = {};
                        tokenData.id = user.id;
                        tokenData.first_name = user.first_name;
                        tokenData.last_name = user.last_name;
                        tokenData.email = user.email;
                        tokenData.mobile = user.mobile;
                        tokenData.preferred_name = user.preferred_name;
                        tokenData.akahuUserId = self.decrypt(user.akahuUserId);
                        tokenData.access_token = self.decrypt(user.access_token);
                        tokenData.access_granted_at = user.access_granted_at;
                        tokenData.profile_picture = user.profile_picture;

                        if (!!user.email && !!user.mpin) {
                            user.isProfileComplete = true;
                        } else {
                            user.isProfileComplete = false;
                        }

                        user.jti = user.id + "_" + randToken.generator({ chars: '0-9' }).generate(6);
                        tokenData.jti = user.id + "_" + randToken.generator({ chars: '0-9' }).generate(6);
                        user.tokenId = jwt.sign(tokenData, CONFIG.JWTTOKENKEY, {
                            expiresIn: '5y'
                        });

                        let deviceTokenInfo = {
                            tokenId: user.tokenId,
                            jti: user.jti,
                        };

                        delete user.akahuUserId;
                        delete user.access_token;
                        delete user.access_granted_at;

                        if (!!deviceTokenInfo) {
                            self.updateData({ id: user.id }, { tokenId: deviceTokenInfo.tokenId, jti: deviceTokenInfo.jti }, function (err, UpdatedMasterUser) {
                                if (err) {
                                    console.log(err)
                                    callback(AppCode.SomethingWrong);
                                } else {
                                    delete user.deviceTokens;
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

    async aggregate(query, cb) {
        try {
            const items = await prisma.akahuUser.findMany({
                select: {
                    id: true,
                    mobile: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    preferred_name: true,
                    createdAt: true,
                }
            });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }

    async userNotAggregate(query, cb) {
        try {
            const items = await prisma.akahuUser.findMany({
                where: { id: { not: query } },
            });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }

    async getUserDetailsById(query) {
        return new Promise(async (resolve, reject) => {
            await this.findByAttribute(query, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    data.access_token = this.decrypt(data.access_token);
                    data.akahuUserId = this.decrypt(data.akahuUserId);
                    resolve(data)
                }
            })
        })
    }
}

module.exports = akahuUserModel;
