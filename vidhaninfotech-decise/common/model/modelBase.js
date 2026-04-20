const CONFIG = require("./../../config");
const _ = require("lodash");
const customError = require("./../error/customError");
const uuid = require('uuid');
const crypto = require('crypto');
const AWS = require('aws-sdk');
AWS.config.update({
    region: "eu-north-1",
    maxRetries: 3,
    httpOptions: { timeout: 30000, connectTimeout: 5000 },
    accessKeyId: 'AKIA5J3ADIJ2N74DA775',
    secretAccessKey: "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"

})
const db = new AWS.DynamoDB.DocumentClient();
const dynamoDb = new AWS.DynamoDB();

class ModelBase {
    constructor(collectionName, fieldSize, schema) {
        this.tableName = collectionName;
        this.schema = schema;
        this.fieldSize = fieldSize;
        this.db = db;
        this.secretKeyForEncryptDecrypt = '47ae4317c21980aa2c00d3e310224689';
        this.iv = this.secretKeyForEncryptDecrypt.substring(0, 16).toString('hex');
    }

    // check table is available or not
    async getModel() {
        try {
            const tableExists = await doesTableExist(this.tableName);

            if (!tableExists) {
                await createTable(this.tableName, "id", this.fieldSize);
            }

            return true
        }
        catch (err) {
            return false;
        }
    }

    // add new data
    async insert(data, cb) {
        const getTable = await this.getModel();

        data.id = (Date.now()).toString() + (Math.round(Math.random() * 1E9).toString());

        const params = {
            TableName: this.tableName,
            Item: data
        };
        try {
            const create = await db.put(params).promise();
            cb(null, data);
        }
        catch (err) {
            cb(err)
        }

    }

    async insertMany(query, cb) {
        const getTable = await this.getModel();

        const insertPromise = query.map((item) => {
            item.id = (Date.now()).toString() + (Math.round(Math.random() * 1E9).toString());

            const putParams = {
                TableName: this.tableName,
                Item: item
            };
            return db.put(putParams).promise();
        });

        try {
            await Promise.all(insertPromise);
            cb(null, query);
        } catch (error) {
            console.error('Error create items:', error);
            cb(error);
        }
    };

    // update old data
    async updateData(query, data, cb) {

        const updateExpressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.entries(data).forEach(([key, value], index) => {
            const attributeName = `#attr${index + 1}`;
            updateExpressionParts.push(`${attributeName} = :value${index + 1}`);
            expressionAttributeNames[attributeName] = key;
            expressionAttributeValues[`:value${index + 1}`] = value;
        });

        const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

        const params = {
            TableName: this.tableName,
            Key: query,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        };

        try {
            const update = await db.update(params).promise();
            cb(null, update);
        }
        catch (err) {
            cb(err)
        }

    }

    // update multiple Data
    async updateMultiple(query, data, cb) {

        const updatePromises = query.map(async (queryData) => {
            data.updatedAt = new Date().toISOString();
            return new Promise((resolve, reject) => {
                this.updateMany(queryData, data, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        try {
            const results = await Promise.all(updatePromises);
            cb(null, results);
        } catch (error) {
            cb(error);
        }
    }

    async updateMany(query, data, cb) {

        const updateExpressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.entries(data).forEach(([key, value], index) => {
            const attributeName = `#attr${index + 1}`;
            updateExpressionParts.push(`${attributeName} = :value${index + 1}`);
            expressionAttributeNames[attributeName] = key;
            expressionAttributeValues[`:value${index + 1}`] = value;
        });

        const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

        const params = {
            TableName: this.tableName,
            Key: query,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        };
        try {
            const update = await db.update(params).promise();
            cb(null, update);
        }
        catch (err) {
            cb(err)
        }

    }

    // get all data from the table
    async get(cb) {
        const getTable = await this.getModel();

        const params = {
            TableName: this.tableName
        }
        try {
            const { Items = [] } = await db.scan(params).promise();
            cb(null, Items);

        } catch (error) {
            cb(error);
        }
    }

    // get data by id from the table
    async findOne(id, cb) {
        const params = {
            TableName: this.tableName,
            Key: id
        }
        try {
            const Items = await db.get(params).promise()
            cb(null, Items.Item);

        } catch (error) {
            cb(error);
        }
    }

    async findByAttribute(query, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            FilterExpression: "#attName = :attValue",
            ExpressionAttributeNames: {
                "#attName": Object.keys(query)[0],
            },
            ExpressionAttributeValues: {
                ":attValue": Object.values(query)[0],
            },
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items[0]);

        } catch (error) {
            cb(error);
        }
    }

    async findByMultipleAttribute(query, cb) {

        const filterExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.entries(query).forEach(([key, value], index) => {
            const attributeName = `#attr${index + 1}`;
            filterExpression.push(`${attributeName} = :value${index + 1}`);
            expressionAttributeNames[attributeName] = key;
            expressionAttributeValues[`:value${index + 1}`] = value;
        });

        const mainFilterExpression = `${filterExpression.join(' AND ')}`;

        const params = {
            TableName: this.tableName,
            FilterExpression: mainFilterExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        };

        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items[0]);
        }
        catch (err) {
            cb(err)
        }

    }

    async aggregate(query, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            FilterExpression: "#attName = :attValue",
            ExpressionAttributeNames: {
                "#attName": Object.keys(query)[0],
            },
            ExpressionAttributeValues: {
                ":attValue": Object.values(query)[0],
            },
        };
        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);

        } catch (error) {
            cb(error);
        }
    }

    async aggregateByMultipleAttribute(query, cb) {

        const filterExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.entries(query).forEach(([key, value], index) => {
            const attributeName = `#attr${index + 1}`;
            filterExpression.push(`${attributeName} = :value${index + 1}`);
            expressionAttributeNames[attributeName] = key;
            expressionAttributeValues[`:value${index + 1}`] = value;
        });

        const mainFilterExpression = `${filterExpression.join(' AND ')}`;

        const params = {
            TableName: this.tableName,
            FilterExpression: mainFilterExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        };

        try {
            const { Items = [] } = await this.db.scan(params).promise();
            cb(null, Items);
        }
        catch (err) {
            cb(err)
        }

    }

    // delete data using id from the table
    async delete(id, cb) {
        const getTable = await this.getModel();
        const params = {
            TableName: this.tableName,
            Key: id
        };
        try {
            db.get(params, (err, getData) => {
                if (err) {
                    cb(err);
                }
                else if (_.isEmpty(getData) || _.isNull(getData)) {
                    cb(err, { deletedCount: 0 })
                }
                else {
                    db.delete(params, function (err, data) {
                        if (err) {
                            console.error("Unable to delete item. Error JSON:", JSON.stringify(err));
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
                }
            })
        } catch (err) {
            console.log("catch err : ", err);
            cb(err)
        }
    }

    async deleteMany(query, cb) {
        const getTable = await this.getModel();
        const scanParams = {
            TableName: this.tableName,
            FilterExpression: '#attName = :attValue',
            ExpressionAttributeNames: {
                "#attName": Object.keys(query)[0],
            },
            ExpressionAttributeValues: {
                ":attValue": Object.values(query)[0],
            },
        };
        try {
            const scanResult = await db.scan(scanParams).promise();
            const deletePromises = scanResult.Items.map((item) => {
                const deleteParams = {
                    TableName: this.tableName,
                    Key: {
                        id: item.id,
                    },
                };
                return db.delete(deleteParams).promise();
            });

            await Promise.all(deletePromises);
            cb(null, Object.values(query)[0]);
        } catch (error) {
            console.error('Error deleting items:', error);
            cb(error);
        }
    };


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

    /**
     * @description Validate data based on entire schema
     * @param {*} data
     */
    validate(data) {
        var self = this;

        for (var key in data) {
            let scm = self.schema[key];
            let val = data[key];

            if (
                val === "" ||
                val === null ||
                val === undefined
            ) {
                if (scm === undefined) {
                    return new customError.InvalidInputError(
                        "field " + key + " not exist"
                    );
                }

                if (!scm.allowNullEmpty) {
                    return new customError.InvalidInputError(
                        key + " should not be empty"
                    );
                }
            } else {
                if (scm === undefined) {
                    return new customError.InvalidInputError(
                        "field " + key + " not exist"
                    );
                }
                if (
                    !_.isObject(val) &&
                    /^\d+$/.test(val) &&
                    scm.type.name.toString().toLowerCase() === "number"
                ) {
                    val = parseInt(val);
                }

                if (!(typeof val === scm.type.name.toString().toLowerCase())) {
                    if (_.isArray(val)) {
                        if ("array" !== scm.type.name.toString().toLowerCase()) {
                            return new customError.InvalidInputError(
                                key + " should not be empty"
                            );
                        }
                    } else if (_.isObject(val)) {
                        if ("object" !== scm.type.name.toString().toLowerCase()) {
                            return new customError.InvalidInputError(
                                key + " should not be empty"
                            );
                        }
                    } else {
                        return new customError.InvalidInputError(
                            key + " should be type of " + scm.type.name
                        );
                    }
                } else if (scm.enum && !scm.enum[val]) {
                    return new customError.InvalidInputError(
                        key + " should be type of supported type"
                    );
                } else if (scm.regex && !scm.regex.test(String(val).toLowerCase())) {
                    return new customError.InvalidInputError(
                        val + " is not a valid " + key
                    );
                }
            }
        }
    }

    generateNumericId() {
        const uuidValue = uuid.v4();
        // Extract numeric portion from the UUID
        const numericId = parseInt(uuidValue.replace(/-/g, ''), 16);
        return numericId;
    }

    /**
     *
     * @param {*} data
     * @param {Array} fields
     */
    oneOfTheFieldMustPresent(data, fields) {
        var f = false;
        var isFieledAvailable = false;
        for (let idx = 0; idx < fields.length; idx++) {
            f = f || !_.isEmpty(data[fields[idx]]);
            var val = data[fields[idx]];
            if (
                val === "" ||
                val === null ||
                val === undefined
            ) {
            } else {
                isFieledAvailable = true;
            }
        }

        if (!isFieledAvailable)
            return new customError.InvalidInputError(
                "one of the fields " + fields.join(", ") + " should exist"
            );
    }

    /**
     *
     * @param {*} data
     * @param {Array} fields
     */
    validateNotEmptyFields(data, fields) {
        for (let idx = 1; idx < fields.length; idx++) {
            if (_.isEmpty(data[fields[idx]])) {
                return new customError.InvalidInputError(
                    fields[idx] + " should not be empty"
                );
            }
        }
    }

    /**
     *
     * @param {*} data
     * @param {Array} fields
     */
    validateNumberFields(data, fields) {
        for (let idx = 0; idx < fields.length; idx++) {
            if (!_.isNumber(data[fields[idx]])) {
                return new customError.InvalidInputError(
                    fields[idx] + " should be a number"
                );
            }
        }
    }

    /**
     *
     * @param {*} data
     * @param {Array} fields
     */
    validateBooleanFields(data, fields) {
        for (let idx = 1; idx < fields.length; idx++) {
            if (!_.isBoolean(data[fields[idx]])) {
                return new customError.InvalidInputError(
                    fields[idx] + " should be a bool"
                );
            }
        }
    }

    sortAccendingDate(a, b) {
        var dateA = new Date(a);
        var dateB = new Date(b);
        return dateA - dateB;
    }

    sortDecendingDate(a, b) {
        var dateA = new Date(a);
        var dateB = new Date(b);
        return dateB - dateA;
    }

    sortAccendingData(a, b) {
        var dataA = a;
        var dataB = b;
        return dataA - dataB;
    }

    sortDecendingData(a, b) {
        var dataA = a;
        var dataB = b;
        return dataB - dataA;
    }

}

// check table is available or not 
const doesTableExist = async (tableName) => {
    try {
        const response = await dynamoDb.describeTable({ TableName: tableName }).promise();
        // Call the function that performs the desired operation on the table
        return true;
    } catch (error) {
        if (error.code === "ResourceNotFoundException") {
            return false;
        } else {
            throw error;
        }
    }
};

// create table code 
const createTable = async (tableName, primaryKey, size) => {
    const params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: primaryKey, KeyType: 'HASH' },  // HASH type for the primary key
        ],
        AttributeDefinitions: [
            { AttributeName: primaryKey, AttributeType: 'S' },  // Assuming string type for the primary key
            // Add other attribute definitions as needed
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: size,  // Adjust according to your needs
            WriteCapacityUnits: size  // Adjust according to your needs
        },
    };
    // Add global secondary indexes or other options as needed
    try {
        await dynamoDb.createTable(params).promise();
        return true;
    } catch (error) {
        console.error('Error creating table:', error.message);
        return false
    }
};

module.exports = ModelBase;