let supportTicketCatorgoryCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const ObjectID = require("mongodb").ObjectID;
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { ObjectId } = require("mongodb");
const { query } = require("express");
const _ = require("lodash");

const supportTicketCategoryModel = new (require("../../../common/model/support-ticket/supportTicketCategoryModel"))();

supportTicketCatorgoryCtrl.create = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    supportTicketCategoryModel.create(data, (err, create) => {
        if (err) {
            console.log(err)
            response.setError(AppCode.Fail);
            response.send(res);
        } else {
            response.setData(AppCode.Success);
            response.send(res);
        }
    });
};

supportTicketCatorgoryCtrl.update = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;

    supportTicketCategoryModel.findOne({ id: req.query.id }, (err, getData) => {
        if (err) {
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (_.isEmpty(getData)) {
            response.setError(AppCode.NotFound);
            response.send(res);
        } else {
            // update code
            supportTicketCategoryModel.update({ id: req.query.id }, data, function (err, update) {
                if (err) {
                    console.log(err)
                    response.setError(AppCode.Fail);
                    response.send(res);
                } else if (update == undefined || (update.matchedCount === 0 && update.modifiedCount === 0)) {
                    response.setError(AppCode.NotFound);
                } else {
                    response.setData(AppCode.Success);
                    response.send(res);
                }
            });
        }
    })
};

supportTicketCatorgoryCtrl.allList = (req, res) => {
    const response = new HttpRespose();
    try {
        supportTicketCategoryModel.get((err, allListData) => {
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
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

supportTicketCatorgoryCtrl.dataByID = (req, res) => {
    const response = new HttpRespose();
    try {

        let query = {
            id: req.query.id
        }

        supportTicketCategoryModel.findOne(query, (err, particularData) => {
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
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

supportTicketCatorgoryCtrl.delete = (req, res) => {
    const response = new HttpRespose();
    try {
        var query = {
            id: req.query.id,
        }

        supportTicketCategoryModel.findOne(query, function (err, categoryData) {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else {
                if (categoryData === null) {
                    response.setError(AppCode.NotFound);
                    response.send(res);
                } else {
                    let status;
                    if (categoryData.status == 1) {
                        status = 2;
                    }
                    else {
                        status = 1
                    }
                    supportTicketCategoryModel.update(query, { status: status }, function (err, data) {
                        if (err) {
                            AppCode.Fail.error = err.message;
                            response.setError(AppCode.Fail);
                            response.send(res);
                        } else {
                            if (status == 1) {
                                response.setData({
                                    code: 200,
                                    message: "Category Activated"
                                });
                            }
                            else {
                                response.setData({
                                    code: 200,
                                    message: "Category Deactivated"
                                });
                            }
                            response.send(res);
                        }
                    });
                }
            }
        })

    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

module.exports = supportTicketCatorgoryCtrl;