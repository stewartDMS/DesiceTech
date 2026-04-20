const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class supportTicketTransactionModel extends ModelBase {
    constructor() {
        super("Support-Ticket-Transaction", 15, {
            id: { type: String, allowNullEmpty: true },
            ticketID: { type: String, allowNullEmpty: true },
            description: { type: String, allowNullEmpty: true },
            files: { type: Array, allowNullEmpty: true },
            isActive: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "Active", 2: "Deactive" }
            },
            isSendByAdminSupport: {
                type: Number,
                allowNullEmpty: true,
                enum: { 0: "Created", 1: "Reply" }
            },
            createdBy: { type: String, allowNullEmpty: true },
            createdByName: { type: String, allowNullEmpty: true },
            updatedBy: { type: String, allowNullEmpty: true },
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
        data.isActive = 1;

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

module.exports = supportTicketTransactionModel;