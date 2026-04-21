const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash");
const appCods = require("../constant/appCods");

class notificationModel extends ModelBase {
    constructor() {
        super("Notification", 10, {
            id: { type: String, allowNullEmpty: true },
            senderId: { type: String, allowNullEmpty: true },
            receiverId: { type: String, allowNullEmpty: true },
            splitPaymentId: { type: String, allowNullEmpty: true },
            supportTicketId: { type: String, allowNullEmpty: true },
            msg: { type: String, allowNullEmpty: true },
            isRead: { type: Boolean, allowNullEmpty: true },
            isView: { type: Boolean, allowNullEmpty: true },
            createdAt: { type: String, allowNullEmpty: true },
            type: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "Support Ticket Create Notification", 2: "Support Ticket Reply Notification - Admin", 3: "Support Ticket Reply Notification - Mobile", 4: "Split Payment Request", 5: "Payment Success", 6: "Payment Failed" }
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
        data.isRead = false;
        data.isView = false;
        data.createdAt = new Date().toISOString();
        this.insert(data, (err, result) => {
            if (err) {
                return cb(err);
            }

            cb(null, result);
        });
    }

    createMany(data, cb) {
        var self = this;

        data.map(x => {
            x.isRead = false;
            x.isView = false;
            x.createdAt = new Date().toISOString();
        })

        self.insertMany(data, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

    find(conditions, options, cb) {
        this.getModel(function (err, model) {
            if (err) {
                return cb(err);
            }
            if (!_.isEmpty(options)) {
                const limit = (!_.isEmpty(options) && options.limit) ? options.limit : 20;
                const skip = options.skip ? options.skip : 0;
                const sort = options.sort ? options.sort : { _id: -1 };
                model.find(conditions).sort(options.sort).skip(options.skip).limit(options.limit).toArray(cb);
            } else {
                model.find(conditions).toArray(cb);
            }
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

    async updateMultipleData(query, data, cb) {

        this.aggregate(query, (err, updateData) => {
            if (err) {
                cb(err)
            }
            else {
                let queryList = [];
                if (updateData.length == 0) {
                    return cb(null, "Success")
                }

                updateData.filter(x => {
                    let obj = {
                        id: x.id
                    }
                    queryList.push(obj)
                })

                var err = this.validate(data);
                if (err) {
                    return cb(err);
                }

                var self = this;
                self.updateMultiple(queryList, data, function (err, result) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, updateData);
                });
            }
        });


    }

    async aggregate(query, cb) {
        try {
            const items = await this._model().findMany({ where: query });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }


}

module.exports = notificationModel;