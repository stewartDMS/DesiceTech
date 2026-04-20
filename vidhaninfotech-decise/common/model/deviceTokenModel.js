const ModelBase = require("./modelBase");
const CONFIG = require("./../../config");
const _ = require("lodash")

class deviceTokenModel extends ModelBase {
    constructor() {
        super("deviceToken", 10, {
            id: { type: String, allowNullEmpty: true },
            deviceToken: { type: String, allowNullEmpty: true },
            deviceType: { type: Number, allowNullEmpty: true },
            deviceId: { type: String, allowNullEmpty: true },
            akahuUserId: { type: String, allowNullEmpty: true },
            createdAt: { type: String, allowNullEmpty: true },
            updatedAt: { type: String, allowNullEmpty: true }
        });
    }

    /**
     * @description create Always return an unique id after inserting new user
     * @param {*} data
     * @param {*} cb
     */
    create(data, cb) {
        console.log(data);
        var err = this.validate(data);

        if (err) {
            return cb(err);
        }

        data.createdAt = new Date().toISOString();

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

module.exports = deviceTokenModel;