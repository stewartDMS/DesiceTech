const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash");
const appCods = require("../constant/appCods");

class errorLogModel extends ModelBase {
    constructor() {
        super("Error-Logs", 5, {
            id: { type: String, allowNullEmpty: true },
            errorMessage: { type: String, allowNullEmpty: true },
            tableName: { type: String, allowNullEmpty: true },
            createdAt: { type: String, allowNullEmpty: true },
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

module.exports = errorLogModel;