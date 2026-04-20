const ModelBase = require("./modelBase");
const CONFIG = require("../../config");
const _ = require("lodash");
const uuid = require('uuid');
const prisma = require("../db/prismaClient");

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

    async create(data, cb) {
        var err = this.validate(data);
        if (err) {
            return cb(err);
        }

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
        try {
            const item = await prisma.monitization.findFirst({
                where: {
                    minAmount: { lte: amount },
                    maxAmount: { gte: amount },
                },
                select: { amount: true, percentage: true, paymentMode: true },
            });
            cb(null, item);
        } catch (error) {
            cb(error);
        }
    }

    async aggregate(query, cb) {
        try {
            const items = await prisma.monitization.findMany();
            cb(null, items);
        } catch (error) {
            cb(error);
        }
    }
}

module.exports = monitizationModel;