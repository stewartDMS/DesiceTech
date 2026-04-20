const express = require("express");
const router = express.Router();

const splitPaymentTransactionCtrl = require("../../../services/security/split-payment-ctrl/splitPaymentTransactionCtrl");
const splitPaymentCategoryCtrl = require("../../../services/security/split-payment-ctrl/splitPaymentCategoryCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// ----------------------------------------------------------------------------------------------------------------------------------
// category module api start
// http://localhost:3001/v1/split-payment/category/create
router.route("/category/create").post(CONFIG.JWTTOKENALLOWACCESS, splitPaymentCategoryCtrl.create)

// http://localhost:3001/v1/split-payment/category/update
router.route("/category/update").put(CONFIG.JWTTOKENALLOWACCESS, splitPaymentCategoryCtrl.update)

// http://localhost:3001/v1/split-payment/category/all-list
router.route("/category/all-list").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentCategoryCtrl.allList);

// http://localhost:3001/v1/split-payment/category/active-list
router.route("/category/active-list").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentCategoryCtrl.allActiveList);

// http://localhost:3001/v1/split-payment/category/dataget-byID
router.route("/category/dataget-byID").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentCategoryCtrl.dataByID);

// http://localhost:3001/v1/split-payment/category/active-deactive
router.route("/category/active-deactive").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentCategoryCtrl.activeDeactive);
// category module api end
// ----------------------------------------------------------------------------------------------------------------------------------


// ----------------------------------------------------------------------------------------------------------------------------------
// split payment api start
// http://localhost:3001/v1/split-payment/transaction-create
router.route("/transaction-create").post(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.create);

// http://localhost:3001/v1/split-payment/update-splitPayment-Users
router.route("/update-splitPayment-Users").post(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.updateSplitPaymentUser);

// http://localhost:3001/v1/split-payment/all-list
router.route("/all-list").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.splitPaymentAllList);

// http://localhost:3001/v1/split-payment/delete-splitPayment
router.route("/delete-splitPayment").delete(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.deleteSplitPayment);

// http://localhost:3001/v1/split-payment/all-list-fAdmin
router.route("/all-list-fAdmin").get(splitPaymentTransactionCtrl.splitPaymentAllListForAdmin);

// http://localhost:3001/v1/split-payment/payment-request
router.route("/payment-request").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.paymentRequest);

// http://localhost:3001/v1/split-payment/make-split-payment
router.route("/make-split-payment").post(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.makeSplitPayment);

// http://localhost:3001/v1/split-payment/user-transactions
router.route("/user-transactions").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.userTransactions);

// http://localhost:3001/v1/split-payment/admin-transactions
router.route("/admin-transactions").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.adminTransactions);

// http://localhost:3001/v1/split-payment/count
router.route("/count").get(CONFIG.JWTTOKENALLOWACCESS, splitPaymentTransactionCtrl.getHomeCount);
// split payment api end
// ----------------------------------------------------------------------------------------------------------------------------------




module.exports = router;