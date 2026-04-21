const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const AppCode = require("../constant/appCods");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const saltRounds = 10;
const validator = {
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    mobile: /^\d+$/
};
const _ = require("lodash");

/*
*For store user registration varification code
*/
class verificationCodeModel extends ModelBase {
    constructor() {
        super("Verification-Code", 10, {
            id: { type: String, allowNullEmpty: true },
            adminUserId: { type: String, allowNullEmpty: true },
            token: { type: String, allowNullEmpty: true },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "not Verify", 2: "verify" }
            },
            createdAt: { type: String, allowNullEmpty: true },
            expiredAt: { type: String, allowNullEmpty: true },
        });
    }

    create(data, cb) {
        data.adminUserId = data.adminUserId;
        data.token = randToken.generator({ chars: '0-9' }).generate(4);
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        var self = this;
        data.status = 1;
        data.createdAt = new Date().toISOString();
        var currentTime = new Date();
        currentTime.setMinutes(currentTime.getMinutes() + 10);
        data.expiredAt = new Date(currentTime).toISOString();

        self.insert(data, function (err, details) {
            if (err) {
                return cb(err);
            }
            cb(null, details);
        });
    }

    update(query, data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.updatedAt = new Date().toISOString();

        this.updateData(query, data, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }
}


module.exports = verificationCodeModel;
