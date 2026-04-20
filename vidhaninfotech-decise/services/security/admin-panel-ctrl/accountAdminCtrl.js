let accountAdminCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query } = require("express");
const _ = require("lodash");

const adminAccountModel = new (require("../../../common/model/adminAccountModel"))();
const errorLogModel = new (require("../../../common/model/errorLogModel"))();

accountAdminCtrl.create = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    // create code here
    try {
        adminAccountModel.get((err, accountDetails) => {
            if (err) {
                errorLogModel.create({ errorMessage: err.message, tableName: "Admin-Account" }, (err, create) => {
                    response.setError(AppCode.Fail);
                    response.send(res);
                });
            } else if (_.isEmpty(accountDetails)) {
                data.isPrimary = true;
                adminAccountModel.create(data, (err, create) => {
                    if (err) {
                        errorLogModel.create({ errorMessage: err.message, tableName: "Admin-Account" }, (err, create) => {
                            response.setError(AppCode.Fail);
                            response.send(res);
                        });
                    } else {
                        response.setData(AppCode.AccountDataSave);
                        response.send(res);
                    }
                });
            } else {
                adminAccountModel.create(data, (err, create) => {
                    if (err) {
                        errorLogModel.create({ errorMessage: err.message, tableName: "Admin-Account" }, (err, create) => {
                            response.setError(AppCode.Fail);
                            response.send(res);
                        });
                    } else {
                        response.setData(AppCode.AccountDataSave);
                        response.send(res);
                    }
                });
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: err.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }
};

accountAdminCtrl.update = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    // update code here
    try {
        adminAccountModel.findOne({ id: req.query.id }, (err, getData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(getData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                // update code
                adminAccountModel.update({ id: req.query.id }, data, function (err, update) {
                    if (err) {
                        console.log(err)
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                        response.setError(AppCode.NotFound);
                    } else {
                        response.setData(AppCode.AccountDataUpdate);
                        response.send(res);
                    }
                });
            }
        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.Fail);
            response.send(res);
        });
    }

};

accountAdminCtrl.allList = (req, res) => {
    const response = new HttpRespose();
    try {
        adminAccountModel.get((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, allListData);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

accountAdminCtrl.dataByID = (req, res) => {
    const response = new HttpRespose();
    try {

        let query = {
            id: req.query.id
        }

        adminAccountModel.findOne(query, (err, particularData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(particularData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, particularData);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

accountAdminCtrl.primaryAccountDetails = (req, res) => {
    const response = new HttpRespose();
    try {
        adminAccountModel.getPrimaryAccountDetails((err, primaryAccountData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(primaryAccountData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, primaryAccountData);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

accountAdminCtrl.delete = (req, res) => {
    const response = new HttpRespose();
    try {
        var query = {
            id: req.query.id,
        }
        adminAccountModel.delete(query, (err, data) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (data == undefined || data.deletedCount === 0) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else {
                response.setData(AppCode.AccountDelete);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

accountAdminCtrl.setAsPrimaryAccount = (req, res) => {
    const response = new HttpRespose();
    try {

        var id = req.query.id;

        adminAccountModel.getSetPrimaryForData(id, (err, FalseData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(FalseData)) {
                response.setError(AppCode.DefaultPrimary);
                response.send(res);
            } else {

                let IDs = FalseData;
                console.log(IDs);
                adminAccountModel.updateMultiple(IDs, { isPrimary: false }, function (err, updatedData) {
                    if (err) {
                        console.log(err)
                        response.setError(err);
                        response.send(res);
                    } else if (updatedData == undefined || (updatedData.matchedCount === 0 && updatedData.modifiedCount === 0)) {
                        response.setError(AppCode.NotFound);
                    } else {
                        adminAccountModel.update({ id: id }, { isPrimary: true }, function (err, update) {
                            if (err) {
                                console.log(err)
                                response.setError(AppCode.Fail);
                                response.send(res);
                            } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                                response.setError(AppCode.NotFound);
                            } else {
                                response.setData(AppCode.AccountPrimary);
                                response.send(res);
                            }
                        });
                    }
                });
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Admin-Account" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

module.exports = accountAdminCtrl;