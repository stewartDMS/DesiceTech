const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")
const prisma = require("../../db/prismaClient");

class akahuAccountModel extends ModelBase {
    constructor() {
        super("Akahu-User-Account", 15, {
            akahuUserId: { type: String, allowNullEmpty: true },
            accountData: { type: String, allowNullEmpty: true },
            setAsPrimary: { type: Boolean, allowNullEmpty: true },
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

        this.insert(data, (err, result) => {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

    createMany(data, cb) {
        var self = this;

        data.map(x => {
            x.createdAt = new Date().toISOString();
        })

        self.insertMany(data, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result);
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

    async updateMultipleAccountData(data, cb) {
        const updatePromises = data.map(async (queryData) => {
            return new Promise((resolve, reject) => {
                let odata = {
                    accountData: queryData.accountData,
                    updatedAt: new Date().toISOString(),
                    status: 1
                }
                this.updateMany({ id: queryData.id }, odata, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        try {
            const results = await Promise.all(updatePromises);
            cb(null, results);
        } catch (error) {
            cb(error);
        }
    }

    async getAccountDetailsByUserId(userId) {
        return new Promise(async (resolve, reject) => {
            await this.findByMultipleAttribute({ akahuUserId: userId, setAsPrimary: true }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    data.accountData = this.decryptObject(data.accountData);
                    resolve(data)
                }
            })
        })
    }

    async getAccountDetailsOfUserWise(userId) {
        return new Promise(async (resolve, reject) => {
            await this.aggregate({ akahuUserId: userId }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    data.map((x) => {
                        x.accountData = this.decryptObject(x.accountData);
                    })
                    resolve(data)
                }
            })
        })
    }

    async getAccountDetails(accountId) {
        return new Promise(async (resolve, reject) => {
            await this.findByMultipleAttribute({ id: accountId }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    data.accountData = this.decryptObject(data.accountData);
                    resolve(data)
                }
            })
        })
    }

    async getSetPrimaryForData(id, akahuUserId, cb) {
        try {
            const items = await prisma.akahuUserAccount.findMany({
                where: {
                    id: { not: id },
                    akahuUserId: akahuUserId,
                },
                select: { id: true },
            });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }
}

module.exports = akahuAccountModel;
