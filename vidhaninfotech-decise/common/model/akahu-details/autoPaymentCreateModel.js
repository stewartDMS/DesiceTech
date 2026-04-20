const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class autoPaymentCreateModel extends ModelBase {
    constructor() {
        super("Custom-Auto-Payments", 5, {
            id: { type: String, allowNullEmpty: true },
            userId: { type: String, allowNullEmpty: false },
            purpose: { type: String, allowNullEmpty: true },
            receiverName: { type: String, allowNullEmpty: false },
            receiverAccountNumber: { type: String, allowNullEmpty: false },
            amount: { type: Number, allowNullEmpty: false },
            autoPaymentDate: { type: String, allowNullEmpty: false },
            createdBy: { type: String, allowNullEmpty: true },
            updatedBy: { type: String, allowNullEmpty: true },
            userAccountId: { type: String, allowNullEmpty: true },
            isDeleted: { type: Boolean, allowNullEmpty: true },
            paymentType: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "Weekly", 2: "Monthly", 3: "Yearly", 4: "Date" }
            },
            type: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "Is Auto", 2: "Is Custom" }
            },
            status: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "active autopayment", 2: "deactive autopayment" }
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
        data.status = 2;
        data.isDeleted = false;

        this.insert(data, (err, result) => {
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

    async getAutoPaymentListData(userId) {
        return new Promise((resolve, reject) => {
            this.aggregate({ userId: userId }, (err, result) => {
                if (err) {
                    reject(err); // Reject with error if there's an error
                } else {
                    resolve(result); // Resolve with result if successful
                }
            });
        });
    }

    async findAndUpdateAndCreate(x) {
        return new Promise(async (resolve, reject) => {
            await this.findByMultipleAttribute({ userId: x.userId, userAccountId: x.userAccountId, purpose: x.purpose }, (err, result) => {
                if (err) {
                    reject(err); // Reject with error if there's an error
                } else {
                    if (!result) {
                        this.create(x, (err, data) => {
                            resolve(true)
                        })
                    }
                    else {
                        this.update({ id: result.id }, { autoPaymentDate: new Date(x.autoPaymentDate).toISOString(), isDeleted: false }, (err, data) => {
                            resolve()
                        })
                    }
                }
            });
        });
    }

    async findAutoPaymentAndDeleteIt(userId, userAccountId) {
        return new Promise(async (resolve, reject) => {
            await this.aggregateByMultipleAttribute({ userId: userId, userAccountId: userAccountId }, (err, result) => {
                if (err) {
                    reject(err); // Reject with error if there's an error
                } else {
                    if (!!result && result.length > 0) {
                        result.map((x, index) => {
                            this.updateMany({ id: x.id }, { isDeleted: true }, (err, data) => {
                                if (index + 1 == result.length) {
                                    resolve(true)
                                }
                            })

                        })
                    }
                    else {
                        resolve()
                    }
                }
            });
        });
    }

    async findSingleAndIfExtraThenRemoveIt(listOfAutoPayments, userId, userAccountId) {
        return new Promise(async (resolve, reject) => {
            await this.aggregateByMultipleAttribute({ userId: userId, userAccountId: userAccountId }, async (err, result) => {
                if (err) {
                    reject(err); // Reject with error if there's an error
                } else {
                    if (!!result && result.length > 0) {

                        for (let index = 0; index < result.length; index++) {
                            const x = result[index];

                            let checkMap = listOfAutoPayments.filter((y) => y.userId == x.userId && y.userAccountId == x.userAccountId && y.purpose == x.purpose)

                            if (checkMap.length == 0) {
                                await this.updateFunction({ id: x.id }, { isDeleted: true });
                            }
                            if (result.length == index + 1) {
                                resolve()
                            }
                        }
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }

    async updateFunction(query, data) {
        return new Promise(async (resolve, reject) => {
            await this.update(query, data, (err, updated) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

}

module.exports = autoPaymentCreateModel;