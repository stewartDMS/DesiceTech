const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash")
const prisma = require("../db/prismaClient");

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

    create(data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

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
        this.updateData(query, data, (err, result) => {
            if (err) {
                return cb(err);
            }
            cb(null, result);
        });
    }

    async getPrimaryAccountDetails(cb) {
        try {
            const items = await prisma.adminAccount.findMany({ where: { isPrimary: true } });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }

    async getSetPrimaryForData(id, cb) {
        try {
            const items = await prisma.adminAccount.findMany({
                where: { id: { not: id } },
                select: { id: true },
            });
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }
}

module.exports = adminAccountModel;