const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash");
const appCods = require("../constant/appCods");

class newsLetterSubscriptionModel extends ModelBase {
    constructor() {
        super("News-Letter-Subscription", 5, {
            id: { type: String, allowNullEmpty: true },
            email: { type: String, allowNullEmpty: true },
            subscriptionDate: { type: String, allowNullEmpty: true },
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
        data.subscriptionDate = new Date().toISOString();
        this.insert(data, (err, result) => {
            if (err) {
                return cb(err);
            }

            cb(null, result);
        });
    }

}

module.exports = newsLetterSubscriptionModel;