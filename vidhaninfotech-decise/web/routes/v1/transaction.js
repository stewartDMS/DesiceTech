const express = require("express");
const router = express.Router();

const transactionCtrl = require("../../../services/security/akahu-ctrl/transactionCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// category module api start

// http://localhost:3001/v1/transaction/list
router.route("/list").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.transactionList)

// http://localhost:3001/v1/transaction/typeWiseListOfTransactions
router.route("/typeWiseListOfTransactions").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.typeWiseListOfTransactions)

// http://localhost:3001/v1/transaction/home-count
router.route("/home-count").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.dashboardListCount)

// http://localhost:3001/v1/transaction/monthlyEarnings
router.route("/monthlyEarnings").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.monthlyEarnings)

// http://localhost:3001/v1/transaction/lastthreeYearEarnings
router.route("/lastthreeYearEarnings").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.lastthreeYearEarnings)

// http://localhost:3001/v1/transaction/revenuseUpdate
router.route("/revenuseUpdate").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.revenuseUpdate)

// http://localhost:3001/v1/transaction/monthYearList
router.route("/monthYearList").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.monthYearList)

// http://localhost:3001/v1/transaction/repeatTransactionList
router.route("/repeatTransactionList").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.repeatTransactionList)

// http://localhost:3001/v1/transaction/deleteTransaction
router.route("/deleteTransaction").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.deleteTransaction)

// http://localhost:3001/v1/transaction/failureTransactionDetails
router.route("/failureTransactionDetails").get(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.failureTransactionDetails)

// http://localhost:3001/v1/transaction/reFailedPayment
router.route("/reFailedPayment").post(CONFIG.JWTTOKENALLOWACCESS, transactionCtrl.reFailedPayment)

module.exports = router;