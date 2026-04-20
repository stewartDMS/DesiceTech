const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const AppCode = require("../../constant/appCods");
const saltRounds = 10;

class registerNewUserModel extends ModelBase {
    constructor() {
        super("Inquiry-Registration", 5, {
            id: { type: String, allowNullEmpty: true },
            firstName: { type: String, allowNullEmpty: false },
            lastName: { type: String, allowNullEmpty: false },
            email: { type: String, allowNullEmpty: false },
            phone: { type: String, allowNullEmpty: false },
            description: { type: String, allowNullEmpty: true },
            isNewZealandBankAccount: { type: Boolean, allowNullEmpty: false },
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

module.exports = registerNewUserModel;