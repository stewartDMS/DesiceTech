let splitPaymentCategoryCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");

const splitPaymentCategoryModel = new (require("../../../common/model/split-payment/splitPaymentCategoryModel"))();

splitPaymentCategoryCtrl.create = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;
    // create code here;
    if (!!data.akahuGroupId) {
        data.akahuGroupId = splitPaymentCategoryModel.encrypt(data.akahuGroupId);
    }

    splitPaymentCategoryModel.create(data, (err, create) => {
        if (err) {
            console.log(err)
            response.setError(AppCode.Fail);
            response.send(res);
        } else {
            response.setData(AppCode.Success, create);
            response.send(res);
        }
    });
};

splitPaymentCategoryCtrl.update = (req, res) => {
    var response = new HttpRespose()
    var data = req.body;

    // update code here
    if (!!data.akahuGroupId) {
        data.akahuGroupId = splitPaymentCategoryModel.encrypt(data.akahuGroupId);
    }

    splitPaymentCategoryModel.findOne({ id: req.query.id }, (err, getData) => {
        if (err) {
            response.setError(AppCode.Fail);
            response.send(res);
        } else if (_.isEmpty(getData)) {
            response.setError(AppCode.NotFound);
            response.send(res);
        } else {
            // update code
            splitPaymentCategoryModel.update({ id: req.query.id }, data, function (err, update) {
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

splitPaymentCategoryCtrl.allList = (req, res) => {
    const response = new HttpRespose();
    try {
        splitPaymentCategoryModel.get((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {

                allListData.map(x => {
                    if (!!x.akahuGroupId) {
                        x.akahuGroupId = splitPaymentCategoryModel.decrypt(x.akahuGroupId);
                    }
                })

                allListData = allListData.sort((a, b) => splitPaymentCategoryModel.sortAccendingDate(a.createdAt, b.createdAt))

                response.setData(AppCode.Success, allListData);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

splitPaymentCategoryCtrl.allActiveList = (req, res) => {
    const response = new HttpRespose();
    try {
        splitPaymentCategoryModel.getActiveList((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                allListData.map(x => {
                    if (!!x.akahuGroupId) {
                        x.akahuGroupId = splitPaymentCategoryModel.decrypt(x.akahuGroupId);
                    }
                })
                response.setData(AppCode.Success, allListData);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

splitPaymentCategoryCtrl.dataByID = (req, res) => {
    const response = new HttpRespose();
    try {

        let query = {
            id: req.query.id
        }

        splitPaymentCategoryModel.findOne(query, (err, particularData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(particularData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                if (!!particularData.akahuGroupId) {
                    particularData.akahuGroupId = splitPaymentCategoryModel.decrypt(particularData.akahuGroupId);
                }
                response.setData(AppCode.Success, particularData);
                response.send(res);
            }
        });
    } catch (exception) {
        response.setError(AppCode.InternalServerError);
        response.send(res);
    }
}

splitPaymentCategoryCtrl.activeDeactive = (req, res) => {
    const response = new HttpRespose();
    try {
        var query = {
            id: req.query.id,
        }

        splitPaymentCategoryModel.findOne(query, function (err, categoryData) {
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
                    splitPaymentCategoryModel.update(query, { status: status }, function (err, data) {
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

module.exports = splitPaymentCategoryCtrl;