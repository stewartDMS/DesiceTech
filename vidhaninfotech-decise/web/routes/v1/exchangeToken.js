const express = require("express");
const router = express.Router();

const exchangeTokenCtrl = require("../../../services/security/akahu-ctrl/exchangeTokenCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// category module api start

// http://localhost:3001/v1/token/shared/callback
router.route("/shared/callback").get(exchangeTokenCtrl.tokenExchangeCallback)

// http://localhost:3001/v1/token/getWebhooks
router.route("/getWebhooks").get(CONFIG.JWTTOKENALLOWACCESS, exchangeTokenCtrl.getWebhooks)

// http://localhost:3001/v1/token/shared/cratesecretKey
// router.route("/shared/cratesecretKey").get(exchangeTokenCtrl.cratesecretKey)

module.exports = router;