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

// https://localhost:3001/v1/webhook/callback
// https://decisedevelopment.vidhaninfotech.com/v1/webhook/callback
// https://desice.tech/v1/webhook/callback
router.route("/callback").post(exchangeTokenCtrl.webhookCallback)

module.exports = router;