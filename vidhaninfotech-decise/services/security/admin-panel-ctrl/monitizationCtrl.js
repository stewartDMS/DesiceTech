let monitizationCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");

const monitizationModel = new (require("../../../common/model/monitizationModel"))();
const errorLogModel = new (require("../../../common/model/errorLogModel"))();


monitizationCtrl.create = async (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        // create code here
        data.minAmount = parseFloat(data.minAmount);
        data.maxAmount = parseFloat(data.maxAmount);

        monitizationModel.get((err, getData) => {
            if (err) {
                response.setError(AppCode.SomethingWrong);
                response.send(res);
            }
            else {
                if (getData.length > 0) {
                    let rangewiseGetList = [];
                    getData.forEach((x, index) => {
                        if ((x.minAmount <= data.minAmount && x.maxAmount >= data.minAmount) || (x.minAmount <= data.maxAmount && x.maxAmount >= data.maxAmount)) {
                            rangewiseGetList.push(x)
                        }
                    })

                    if (rangewiseGetList.length > 0) {
                        response.setError(AppCode.monitizationDataAvailable);
                        response.send(res);
                        return
                    }
                }

                if (parseInt(data.paymentMode) == 2) {
                    data.percentage = parseFloat(data.percentage);
                }
                else {
                    data.percentage = null;
                }

                if (parseInt(data.paymentMode) == 1) {
                    data.amount = parseFloat(data.amount);
                }
                else {
                    data.amount = null;
                }

                data.paymentMode = parseInt(data.paymentMode);
                data.paymentType = parseInt(data.paymentType);

                monitizationModel.create(data, (err, Create) => {
                    if (err) {
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else {
                        response.setData(AppCode.Success);
                        response.send(res);
                    }
                });
            }


        })
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }



};

monitizationCtrl.allList = async (req, res) => {
    const response = new HttpRespose();
    try {
        monitizationModel.get((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {
                response.setData(AppCode.Success, allListData);
                response.send(res);
            }
        });

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

monitizationCtrl.listOfMonitization = async (req, res) => {
    const response = new HttpRespose();
    try {
        monitizationModel.get((err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {
                response.setData(AppCode.Success, allListData);
                response.send(res);
            }
        });

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

monitizationCtrl.delete = (req, res) => {
    const response = new HttpRespose();
    try {
        var query = {
            id: req.query.id.toString(),
        }

        monitizationModel.delete(query, (err, data) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (data == undefined || data.deletedCount === 0) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

monitizationCtrl.update = (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        // update code here
        data.minAmount = parseFloat(data.minAmount);
        data.maxAmount = parseFloat(data.maxAmount);

        monitizationModel.get((err, getData) => {
            if (err) {
                response.setError(AppCode.SomethingWrong);
                response.send(res);
            }
            else {
                if (getData.length > 0) {
                    let rangewiseGetList = [];
                    getData.forEach((x, index) => {
                        if ((x.minAmount <= data.minAmount && x.maxAmount >= data.minAmount) || (x.minAmount <= data.maxAmount && x.maxAmount >= data.maxAmount)) {
                            rangewiseGetList.push(x)
                        }
                    })

                    if (rangewiseGetList.length > 0 && rangewiseGetList[0].id != req.query.id) {
                        response.setError(AppCode.monitizationDataAvailable);
                        response.send(res);
                        return
                    }
                }



                if (parseInt(data.paymentMode) == 2) {
                    data.percentage = parseFloat(data.percentage);
                }
                else {
                    data.percentage = null;
                }

                if (parseInt(data.paymentMode) == 1) {
                    data.amount = parseFloat(data.amount);
                }
                else {
                    data.amount = null;
                }

                data.paymentMode = parseInt(data.paymentMode);
                data.paymentType = parseInt(data.paymentType);

                monitizationModel.findOne({ id: req.query.id }, (err, getData) => {
                    if (err) {
                        response.setError(AppCode.Fail);
                        response.send(res);
                    } else if (_.isEmpty(getData)) {
                        response.setError(AppCode.NotFound);
                        response.send(res);
                    } else {
                        // update code
                        monitizationModel.update({ id: req.query.id }, data, function (err, update) {
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
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

monitizationCtrl.dataByID = (req, res) => {
    const response = new HttpRespose();
    try {

        let query = {
            id: req.query.id
        }

        monitizationModel.findOne(query, (err, particularData) => {
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
        errorLogModel.create({ errorMessage: exception.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

monitizationCtrl.rangeWiseList = (req, res) => {
    const response = new HttpRespose();
    try {

        let query = parseFloat(req.query.amount)


        monitizationModel.getRangeWiseData(query, (err, rangeWiseList) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(rangeWiseList)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                response.setData(AppCode.Success, rangeWiseList);
                response.send(res);
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "monitization-modal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

module.exports = monitizationCtrl;