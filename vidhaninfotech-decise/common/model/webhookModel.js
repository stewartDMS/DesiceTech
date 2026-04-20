const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const AppCode = require("../constant/appCods");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randToken = require('rand-token');
const saltRounds = 10;
const ObjectID = require("mongodb").ObjectID;
const validator = {
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    mobile: /^\d+$/
};
const _ = require("lodash");

/*
*For store user registration varification code
*/
class webhookModel extends ModelBase {
    constructor() {
        super("Webhook", 5, {
            id: { type: String, allowNullEmpty: true },
            payload: { type: String, allowNullEmpty: true },
            createdAt: { type: String, allowNullEmpty: true },
        });
    }

    create(data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        var self = this;
        data.status = 1;
        data.createdAt = new Date().toISOString();

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


module.exports = webhookModel;
