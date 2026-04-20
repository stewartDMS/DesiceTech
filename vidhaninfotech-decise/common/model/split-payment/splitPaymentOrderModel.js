const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class splitPaymentOrderModel extends ModelBase {
    constructor() {
        super("Split_Payment_Order", 10, {

            id: { type: String, allowNullEmpty: false },
            splitPaymentId: { type: String, allowNullEmpty: false },
            receivePaymentUserId: { type: String, allowNullEmpty: false },
            userId: { type: String, allowNullEmpty: false },
            categoryId: { type: String, allowNullEmpty: false },
            amount: { type: Number, allowNullEmpty: false },
            type: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "Pending", 2: "Received", 3: "Fail", 4: "Cancel" }
            },
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
        data.type = 1;

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

    async findByMultipleAttribute(query, cb) {

        const params = {
            TableName: this.tableName,
            FilterExpression: "#attName = :attValue AND #attName1 <> :attValue1",
            ExpressionAttributeNames: {
                "#attName": "userId",
                "#attName1": "type",
            },
            ExpressionAttributeValues: {
                ":attValue": query.userId,
                ":attValue1": query.type,
            },
        };

        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);
        }
        catch (err) {
            cb(err)
        }

    }

    createMany(data, cb) {
        var self = this;

        data.map(x => {
            x.createdAt = new Date().toISOString();
            x.status = 1;
        })

        self.insertMany(data, function (err, result) {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }
}

module.exports = splitPaymentOrderModel;