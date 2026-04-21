const ModelBase = require("../modelBase");
const CONFIG = require("../../../config");
const _ = require("lodash")
const prisma = require("../../db/prismaClient");

class splitPaymentCategoryModel extends ModelBase {
    constructor() {
        super("Payment_Category", 5, {
            name: { type: String, allowNullEmpty: false },
            akahuGroupId: { type: String, allowNullEmpty: true },
            categoryId: { type: String, allowNullEmpty: true },
            isEditable: { type: Boolean, allowNullEmpty: false },
            status: {
                type: Number,
                allowNullEmpty: false,
                enum: { 1: "active", 2: "inactive" }
            },
        });
    }

    create(data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

        data.createdAt = new Date().toISOString();
        data.status = 1;
        data.isEditable = true;

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

    async getActiveList(cb) {
        try {
            const items = await prisma.splitPaymentCategory.findMany({ where: { status: 1 } });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }
}

module.exports = splitPaymentCategoryModel;