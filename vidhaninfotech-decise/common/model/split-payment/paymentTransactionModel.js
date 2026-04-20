const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class paymentTransactionModel extends ModelBase {
    constructor() {
        super("Payment_Transaction", 10, {
            // transactionId: { type: String, allowNullEmpty: false },
            // senderId: { type: String, allowNullEmpty: false },
            // receiverId: { type: String, allowNullEmpty: true },
            // receiverName: { type: String, allowNullEmpty: true },
            // categoryId: { type: String, allowNullEmpty: true },
            // paymentObject: { type: String, allowNullEmpty: true },
            // transactionData: { type: String, allowNullEmpty: true },
            // createdBy: { type: String, allowNullEmpty: true },

            trans_id: { type: String, allowNullEmpty: true },
            netAmount: { type: Number, allowNullEmpty: true },
            description: { type: String, allowNullEmpty: true },
            amount: { type: Number, allowNullEmpty: true },
            platformFees: { type: Number, allowNullEmpty: true },
            userId: { type: String, allowNullEmpty: true },
            categoryId: { type: String, allowNullEmpty: true },
            type: { type: String, allowNullEmpty: true },
            isAuto: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "MAKE PAYMENT", 2: "AUTO PAYMENT", 3: "TRANSACTION", 4: "Failed Transaction" }
            },
            status: { type: String, allowNullEmpty: true },
            senderName: { type: String, allowNullEmpty: true },
            receiverId: { type: String, allowNullEmpty: true },
            createdAt: { type: String, allowNullEmpty: true },
            receiverName: { type: String, allowNullEmpty: true },
            connectionName: { type: String, allowNullEmpty: true },
            reason: { type: String, allowNullEmpty: true },
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
        // data.transactionId = this.generatePaymentId()
        this.insert(data, (err, result) => {

            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }
    createMany(data, cb) {

        this.insertMany(data, (err, result) => {
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

    generatePaymentId() {
        const currentDate = new Date();
        const timestamp = currentDate.getTime(); // Current timestamp

        // Generate a random 16-digit number
        const randomPart = Math.floor(Math.random() * 9e15) + 1e15; // Random 16-digit number

        // Concatenate the timestamp and random part
        const paymentId = `${timestamp}${randomPart}`;
        return paymentId;
    }

}

module.exports = paymentTransactionModel;