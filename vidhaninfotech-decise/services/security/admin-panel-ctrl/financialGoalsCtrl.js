let financialGoalsCtrl = {};
const HttpRespose = require("../../../common/httpResponse");
const CONFIG = require("../../../config");
const async = require("async");
const AppCode = require("../../../common/constant/appCods");
const { query } = require("express");
const _ = require("lodash");

const financialGoalsModel = new (require("../../../common/model/financialGoalsModel"))();
const errorLogModel = new (require("../../../common/model/errorLogModel"))();


financialGoalsCtrl.create = async (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        // create code here
        data.group = parseInt(data.group);
        financialGoalsModel.findByAttribute({ name: data.name }, (err, getData) => {
            if (err) {
                let errMessage = { code: 1010, message: "Fail....." };;
                errMessage.message = err.message
                response.setError(errMessage);
                response.send(res)
            }
            else if (_.isEmpty(getData)) {
                financialGoalsModel.create(data, (err, Create) => {
                    if (err) {
                        let errMessage = { code: 1010, message: "Fail....." };;
                        errMessage.message = err.message
                        response.setError(errMessage);
                        response.send(res)
                    } else {
                        response.setData(AppCode.Success, Create);
                        response.send(res);
                    }
                });
            }
            else {
                response.setData(AppCode.AlreadyExist);
                response.send(res);
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Financial-Goal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }

};

financialGoalsCtrl.update = async (req, res) => {
    var response = new HttpRespose();

    try {
        var data = req.body;
        // create code here
        data.group = parseInt(data.group);

        financialGoalsModel.findByAttribute({ name: data.name }, (err, getData) => {
            if (err) {
                let errMessage = { code: 1010, message: "Fail....." };;
                errMessage.message = err.message
                response.setError(errMessage);
                response.send(res)
            }
            else if (_.isEmpty(getData)) {
                financialGoalsModel.update({ id: req.query.id }, data, (err, Create) => {
                    if (err) {
                        let errMessage = { code: 1010, message: "Fail....." };;
                        errMessage.message = err.message
                        response.setError(errMessage);
                        response.send(res)
                    } else {
                        response.setData(AppCode.Success, Create);
                        response.send(res);
                    }
                });
            }
            else {
                if (getData.id == req.query.id) {
                    financialGoalsModel.update({ id: req.query.id }, data, (err, Create) => {
                        if (err) {
                            let errMessage = { code: 1010, message: "Fail....." };
                            errMessage.message = err.message
                            response.setError(errMessage);
                            response.send(res)
                        } else {
                            response.setData(AppCode.Success, Create);
                            response.send(res);
                        }
                    });
                }
                else {
                    response.setData(AppCode.AlreadyExist);
                    response.send(res);
                }
            }
        });
    } catch (error) {
        errorLogModel.create({ errorMessage: error.message, tableName: "Financial-Goal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
};

financialGoalsCtrl.allList = async (req, res) => {
    const response = new HttpRespose();
    try {
        financialGoalsModel.get((err, allListData) => {
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
        errorLogModel.create({ errorMessage: exception.message, tableName: "Financial-Goal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

financialGoalsCtrl.allActiveList = async (req, res) => {
    const response = new HttpRespose();
    try {
        financialGoalsModel.aggregate({ status: 1 }, (err, allListData) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            }
            else if (_.isEmpty(allListData)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            }
            else {

                var groupList = allListData.reduce((acc, curr, index) => {
                    const existingGroupId = acc.find((group) => group.group === curr.group);

                    if (existingGroupId) {
                        existingGroupId.goals.push({ name: curr.name, id: curr.id });
                    } else {
                        acc.push({
                            group: curr.group,
                            goals: [{ name: curr.name, id: curr.id }],
                        });
                    }

                    return acc;
                }, []);

                groupList = groupList.sort((a, b) => a.group - b.group)

                let allListOfFinancialGoals = [];

                groupList.map(x => {
                    let obj = {
                        groupId: x.group,
                        group: x?.group == 1 ? 'Debt' : x?.group == 2 ? 'Savings' : x?.group == 3 ? 'Invest' :
                            x?.group == 4 ? 'Billings' : '',
                        goals: x.goals
                    }

                    allListOfFinancialGoals.push(obj)
                })

                response.setData(AppCode.Success, allListOfFinancialGoals);
                response.send(res);
            }
        });

    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Financial-Goal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

financialGoalsCtrl.activeDeactive = (req, res) => {
    const response = new HttpRespose();
    try {
        var query = {
            id: req.query.id.toString(),
        }
        financialGoalsModel.findByAttribute(query, (err, data) => {
            if (err) {
                response.setError(AppCode.Fail);
                response.send(res);
            } else if (_.isEmpty(data)) {
                response.setError(AppCode.NotFound);
                response.send(res);
            } else {
                let updateStatus;
                if (data.status == 1) {
                    updateStatus = 2;
                }
                else {
                    updateStatus = 1;
                }
                financialGoalsModel.update({ id: req.query.id.toString() }, { status: updateStatus }, (err, Create) => {
                    if (err) {
                        const errMessage = { code: 1010, message: "Fail....." };
                        errMessage.message = err.message
                        response.setError(errMessage);
                        response.send(res)
                    } else {
                        const errMessage = { code: 200, message: "Success." };
                        if (updateStatus == 1) {
                            errMessage.message = "Activated Successfully."
                        }
                        else {
                            errMessage.message = "Deactivated Successfully."
                        }
                        response.setData(errMessage);
                        response.send(res);
                    }
                });
            }
        });
    } catch (exception) {
        errorLogModel.create({ errorMessage: exception.message, tableName: "Financial-Goal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

financialGoalsCtrl.dataByID = (req, res) => {
    const response = new HttpRespose();
    try {

        let query = {
            id: req.query.id
        }

        financialGoalsModel.findOne(query, (err, particularData) => {
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
        errorLogModel.create({ errorMessage: exception.message, tableName: "Financial-Goal" }, (err, create) => {
            response.setError(AppCode.InternalServerError);
            response.send(res);
        });
    }
}

module.exports = financialGoalsCtrl;