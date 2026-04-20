const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class supportTicketModel extends ModelBase {
    constructor() {
        super("Support-Ticket", 15, {
            id: { type: String, allowNullEmpty: true },
            userID: { type: String, allowNullEmpty: true },
            priority: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "Normal", 2: "High", 3: "Urgent", 4: "Emergency" }
            },
            categoryID: { type: String, allowNullEmpty: true },
            subject: { type: String, allowNullEmpty: true },
            status: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "Created", 2: "Closed" }
            },
            isActive: {
                type: Number,
                allowNullEmpty: true,
                enum: { 1: "active", 2: "deactive" }
            },
            createdBy: { type: String, allowNullEmpty: true },
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

module.exports = supportTicketModel;