const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash");
const uuid = require('uuid');

// Generate a unique ID

class monitizationModel extends ModelBase {
    constructor() {
        super("Monitization-Module", 10, {
            id: { type: String, allowNullEmpty: false },
            description: { type: String, allowNullEmpty: true },
            minAmount: { type: Number, allowNullEmpty: false },
            maxAmount: { type: Number, allowNullEmpty: false },
            percentage: { type: Number, allowNullEmpty: true },
            amount: { type: Number, allowNullEmpty: true },
            paymentMode: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "amount", 2: "percentage" }
            },
            paymentType: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "auto", 2: "manual" }
            },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "active", 2: "inactive" }
            },
            createdAt: { type: String, allowNullEmpty: true }
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

    async getRangeWiseData(amount, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            FilterExpression: 'minAmount <= :amount and maxAmount >= :amount',
            ExpressionAttributeValues: {
                ':amount': amount,
            },
            ProjectionExpression: 'amount,percentage,paymentMode',
        };

        try {
            const Items = await this.db.scan(params).promise()
            cb(null, Items.Items[0]);

        } catch (error) {
            cb(error);
        }


    }

    async aggregate(query, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);

        } catch (error) {
            cb(error);
        }
    }



}

module.exports = monitizationModel;