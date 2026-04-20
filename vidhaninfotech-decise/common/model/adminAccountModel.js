const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash")

class adminAccountModel extends ModelBase {
    constructor() {
        super("Admin-Accounts", 6, {
            id: { type: String, allowNullEmpty: false },
            accountID: { type: String, allowNullEmpty: true },
            bankName: { type: String, allowNullEmpty: true },
            accountHolderName: { type: String, allowNullEmpty: true },
            prefixCode: { type: String, allowNullEmpty: true },
            isPrimary: { type: Boolean, allowNullEmpty: true },
            status: {
                type: Number,
                allowNullEmpty: false,
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
        data.isPrimary = data.isPrimary ? data.isPrimary : false;

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
        console.log("yes");
        this.updateData(query, data, (err, result) => {
            console.log("yes");
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

    async getPrimaryAccountDetails(cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            FilterExpression: "#isPrimary = :isPrimary",
            ExpressionAttributeNames: {
                "#isPrimary": "isPrimary",
            },
            ExpressionAttributeValues: {
                ":isPrimary": true,
            },
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);

        } catch (error) {
            cb(error);
        }
    }

    async getSetPrimaryForData(id, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            FilterExpression: "#id <> :id",
            ExpressionAttributeNames: {
                "#id": "id",
            },
            ExpressionAttributeValues: {
                ":id": id,
            },
            ProjectionExpression: 'id',
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);

        } catch (error) {
            cb(error);
        }
    }
}

module.exports = adminAccountModel;