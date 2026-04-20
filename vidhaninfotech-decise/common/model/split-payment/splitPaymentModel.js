const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class splitPaymentModel extends ModelBase {
    constructor() {
        super("Split_Payment", 10, {
            categoryId: { type: String, allowNullEmpty: false },
            purpose: { type: String, allowNullEmpty: false },
            splitPaymentPicture: { type: String, allowNullEmpty: true },
            totalAmount: { type: Number, allowNullEmpty: false },
            whoPaid: { type: String, allowNullEmpty: false },
            forWhom: { type: Array, allowNullEmpty: false },
            createdBy: { type: String, allowNullEmpty: false },
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
        data.createdAt = new Date().toISOString();
        data.status = 1;

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
}

module.exports = splitPaymentModel;