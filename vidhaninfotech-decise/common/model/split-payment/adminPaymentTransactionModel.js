const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")

class adminPaymentTransactionModel extends ModelBase {
    constructor() {
        super("Admin_Payment_Transaction", 10, {
            senderId: { type: String, allowNullEmpty: false },
            receiverId: { type: String, allowNullEmpty: true },
            receiverName: { type: String, allowNullEmpty: true },
            transactionId: { type: String, allowNullEmpty: false },
            amount: { type: Number, allowNullEmpty: true },
            parentTransctionId: { type: String, allowNullEmpty: false },
            transactionData: { type: String, allowNullEmpty: false },
            paymentObject: { type: String, allowNullEmpty: false },
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
        data.transactionId = this.generatePaymentId();
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

module.exports = adminPaymentTransactionModel;