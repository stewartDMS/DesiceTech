const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class splitPaymentHistoryModel extends ModelBase {
    constructor() {
        super("Split_Payment_History", 7, {
            splitPaymentId: { type: String, allowNullEmpty: false },
            message: { type: String, allowNullEmpty: true },
            createdBy: { type: String, allowNullEmpty: true },
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

module.exports = splitPaymentHistoryModel;