const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash");
const uuid = require('uuid');

// Generate a unique ID

class financialGoalsModel extends ModelBase {
    constructor() {
        super("financial-Goals", 10, {
            id: { type: String, allowNullEmpty: false },
            name: { type: String, allowNullEmpty: false },
            group: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "Debt", 2: "Savings", 3: "Invest", 4: "Billings" }
            },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "active", 2: "inactive" }
            },
            createdAt: { type: String, allowNullEmpty: true },
            updatedAt: { type: String, allowNullEmpty: true }
        });
    }

    /**
     * @description create Always return an unique id after inserting new user
     * @param {*} data
     * @param {*} cb
     */

    async create(data, cb) {
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

    update(query, data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.updatedAt = new Date().toISOString();

        this.updateData(query, data, (err, result) => {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

}

module.exports = financialGoalsModel;