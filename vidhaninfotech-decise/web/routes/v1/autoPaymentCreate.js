const express = require("express");
const router = express.Router();

const autoPaymentCreateCtrl = require("../../../services/security/akahu-ctrl/autoPaymentCreateCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// category module api start

// http://localhost:3001/v1/autoPaymentCreate/create
router.route("/create").post(CONFIG.JWTTOKENALLOWACCESS, autoPaymentCreateCtrl.create)

// http://localhost:3001/v1/autoPaymentCreate/update
router.route("/update").post(CONFIG.JWTTOKENALLOWACCESS, autoPaymentCreateCtrl.update)

// http://localhost:3001/v1/autoPaymentCreate/delete
router.route("/delete").delete(CONFIG.JWTTOKENALLOWACCESS, autoPaymentCreateCtrl.delete)

// http://localhost:3001/v1/autoPaymentCreate/activeDeactive
router.route("/activeDeactive").get(CONFIG.JWTTOKENALLOWACCESS, autoPaymentCreateCtrl.activeDeactiveAutoPayment)

module.exports = router;