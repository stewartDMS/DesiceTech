'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const uuid = require('uuid');
const customError = require('./../error/customError');
const prisma = require('../db/prismaClient');

// Maps DynamoDB table names → Prisma model delegate names
const TABLE_TO_MODEL = {
    'Admin-User': 'adminUser',
    'Admin-Accounts': 'adminAccount',
    'Akahu-Users': 'akahuUser',
    'Akahu-User-Account': 'akahuUserAccount',
    'Custom-Auto-Payments': 'autoPayment',
    'Inquiry-Registration': 'inquiryRegistration',
    'Split_Payment': 'splitPayment',
    'Split_Payment_Order': 'splitPaymentOrder',
    'Split_Payment_History': 'splitPaymentHistory',
    'Payment_Category': 'splitPaymentCategory',
    'Payment_Transaction': 'paymentTransaction',
    'Admin_Payment_Transaction': 'adminPaymentTransaction',
    'Support-Ticket': 'supportTicket',
    'Support-Ticket-Category': 'supportTicketCategory',
    'Support-Ticket-Transaction': 'supportTicketTransaction',
    'financial-Goals': 'financialGoal',
    'Monitization-Module': 'monitization',
    'Notification': 'notification',
    'deviceToken': 'deviceToken',
    'News-Letter-Subscription': 'newsLetterSubscription',
    'Verification-Code': 'verificationCode',
    'Webhook': 'webhook',
    'Error-Logs': 'errorLog',
};

class ModelBase {
    constructor(tableName, _fieldSize, schema) {
        this.tableName = tableName;
        this.schema = schema;
        this.modelName = TABLE_TO_MODEL[tableName];
        if (!this.modelName) {
            throw new Error(`ModelBase: unknown table name "${tableName}"`);
        }
        this.secretKeyForEncryptDecrypt = process.env.ENCRYPTION_KEY || '47ae4317c21980aa2c00d3e310224689';
        this.iv = this.secretKeyForEncryptDecrypt.substring(0, 16);
    }

    // Returns the Prisma model delegate (e.g. prisma.adminUser)
    _model() {
        return prisma[this.modelName];
    }

    // No-op: tables are created by Prisma migrations, not at runtime
    async getModel() {
        return true;
    }

    // ── Create ────────────────────────────────────────────────────────────

    async insert(data, cb) {
        data.id = (Date.now()).toString() + (Math.round(Math.random() * 1E9).toString());
        try {
            const created = await this._model().create({ data });
            cb(null, created);
        } catch (err) {
            cb(err);
        }
    }

    async insertMany(query, cb) {
        query.forEach(item => {
            item.id = (Date.now()).toString() + (Math.round(Math.random() * 1E9).toString());
        });
        try {
            await this._model().createMany({ data: query });
            cb(null, query);
        } catch (err) {
            cb(err);
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────

    async get(cb) {
        try {
            const items = await this._model().findMany();
            cb(null, items);
        } catch (err) {
            cb(err);
        }
    }

    async findOne(id, cb) {
        try {
            const item = await this._model().findUnique({ where: id });
            cb(null, item);
        } catch (err) {
            cb(err);
        }
    }

    async findByAttribute(query, cb) {
        try {
            const item = await this._model().findFirst({ where: query });
            cb(null, item);
        } catch (err) {
            cb(err);
        }
    }

    async findByMultipleAttribute(query, cb) {
        try {
            const item = await this._model().findFirst({ where: query });
            cb(null, item);
        } catch (err) {
            cb(err);
        }
    }

    async aggregate(query, cb) {
        try {
            const items = await this._model().findMany({ where: query });
            cb(null, items);
        } catch (err) {
            cb(err);
        }
    }

    async aggregateByMultipleAttribute(query, cb) {
        try {
            const items = await this._model().findMany({ where: query });
            cb(null, items);
        } catch (err) {
            cb(err);
        }
    }

    // ── Update ────────────────────────────────────────────────────────────

    async updateData(query, data, cb) {
        try {
            const updated = await this._model().update({ where: query, data });
            cb(null, updated);
        } catch (err) {
            cb(err);
        }
    }

    async updateMany(query, data, cb) {
        try {
            const updated = await this._model().update({ where: query, data });
            cb(null, updated);
        } catch (err) {
            cb(err);
        }
    }

    async updateMultiple(queryList, data, cb) {
        const updatePromises = queryList.map(queryData => {
            data.updatedAt = new Date().toISOString();
            return this._model().update({ where: queryData, data: { ...data } });
        });
        try {
            const results = await Promise.all(updatePromises);
            cb(null, results);
        } catch (err) {
            cb(err);
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────

    async delete(id, cb) {
        try {
            const existing = await this._model().findUnique({ where: id });
            if (!existing) {
                return cb(null, { deletedCount: 0 });
            }
            await this._model().delete({ where: id });
            cb(null, { deletedCount: 1 });
        } catch (err) {
            cb(err);
        }
    }

    async deleteMany(query, cb) {
        try {
            const result = await this._model().deleteMany({ where: query });
            cb(null, result.count);
        } catch (err) {
            cb(err);
        }
    }

    // ── Encryption helpers ────────────────────────────────────────────────

    encrypt(text) {
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKeyForEncryptDecrypt, this.iv);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(encryptedText) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKeyForEncryptDecrypt, this.iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }

    encryptObject(obj) {
        const text = JSON.stringify(obj);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKeyForEncryptDecrypt, this.iv);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decryptObject(encryptedText) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKeyForEncryptDecrypt, this.iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return JSON.parse(decrypted);
    }

    // ── Validation helpers ────────────────────────────────────────────────

    validate(data) {
        for (var key in data) {
            let scm = this.schema[key];
            let val = data[key];

            if (val === '' || val === null || val === undefined) {
                if (scm === undefined) {
                    return new customError.InvalidInputError('field ' + key + ' not exist');
                }
                if (!scm.allowNullEmpty) {
                    return new customError.InvalidInputError(key + ' should not be empty');
                }
            } else {
                if (scm === undefined) {
                    return new customError.InvalidInputError('field ' + key + ' not exist');
                }
                if (
                    !_.isObject(val) &&
                    /^\d+$/.test(val) &&
                    scm.type.name.toString().toLowerCase() === 'number'
                ) {
                    val = parseInt(val);
                }

                if (!(typeof val === scm.type.name.toString().toLowerCase())) {
                    if (_.isArray(val)) {
                        if ('array' !== scm.type.name.toString().toLowerCase()) {
                            return new customError.InvalidInputError(key + ' should not be empty');
                        }
                    } else if (_.isObject(val)) {
                        if ('object' !== scm.type.name.toString().toLowerCase()) {
                            return new customError.InvalidInputError(key + ' should not be empty');
                        }
                    } else {
                        return new customError.InvalidInputError(key + ' should be type of ' + scm.type.name);
                    }
                } else if (scm.enum && !scm.enum[val]) {
                    return new customError.InvalidInputError(key + ' should be type of supported type');
                } else if (scm.regex && !scm.regex.test(String(val).toLowerCase())) {
                    return new customError.InvalidInputError(val + ' is not a valid ' + key);
                }
            }
        }
    }

    generateNumericId() {
        const uuidValue = uuid.v4();
        return parseInt(uuidValue.replace(/-/g, ''), 16);
    }

    oneOfTheFieldMustPresent(data, fields) {
        var isFieledAvailable = false;
        for (let idx = 0; idx < fields.length; idx++) {
            var val = data[fields[idx]];
            if (val !== '' && val !== null && val !== undefined) {
                isFieledAvailable = true;
            }
        }
        if (!isFieledAvailable) {
            return new customError.InvalidInputError(
                'one of the fields ' + fields.join(', ') + ' should exist'
            );
        }
    }

    validateNotEmptyFields(data, fields) {
        for (let idx = 1; idx < fields.length; idx++) {
            if (_.isEmpty(data[fields[idx]])) {
                return new customError.InvalidInputError(fields[idx] + ' should not be empty');
            }
        }
    }

    validateNumberFields(data, fields) {
        for (let idx = 0; idx < fields.length; idx++) {
            if (!_.isNumber(data[fields[idx]])) {
                return new customError.InvalidInputError(fields[idx] + ' should be a number');
            }
        }
    }

    validateBooleanFields(data, fields) {
        for (let idx = 1; idx < fields.length; idx++) {
            if (!_.isBoolean(data[fields[idx]])) {
                return new customError.InvalidInputError(fields[idx] + ' should be a bool');
            }
        }
    }

    sortAccendingDate(a, b) {
        return new Date(a) - new Date(b);
    }

    sortDecendingDate(a, b) {
        return new Date(b) - new Date(a);
    }

    sortAccendingData(a, b) {
        return a - b;
    }

    sortDecendingData(a, b) {
        return b - a;
    }
}

module.exports = ModelBase;
