const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const saltRounds = 10;

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

        // set createdAt date and status
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
                }
                else {
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
                }
                else {
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
                }
                else {
                    data.accountData = this.decryptObject(data.accountData);
                    resolve(data)
                }
            })
        })
    }

    // async aggregate(query, cb) {
    //     const getTable = await this.getModel();

    //     const params = {
    //         TableName: this.tableName,
    //     }

    //     if (query.id) {
    //         params.Key = query.id
    //     }

    //     if (query.projection) {
    //         params.ProjectionExpression = "id,mobile,email,first_name,last_name,preferred_name,createdAt"
    //     }


    //     try {
    //         const { Items = [] } = await this.db.scan(params).promise();
    //         cb(null, Items);

    //     } catch (error) {
    //         cb(error);
    //     }
    // }

    async getSetPrimaryForData(id, akahuUserId, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            FilterExpression: "#id <> :id AND #akahuUserId = :akahuUserId",
            ExpressionAttributeNames: {
                "#id": "id",
                "#akahuUserId": "akahuUserId",
            },
            ExpressionAttributeValues: {
                ":id": id,
                ":akahuUserId": akahuUserId,
            },
            ProjectionExpression: 'id',
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);

        } catch (error) {
            cb(error);
        }
    }
}

module.exports = akahuAccountModel;