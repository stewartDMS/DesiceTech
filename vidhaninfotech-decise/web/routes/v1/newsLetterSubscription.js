const express = require("express");
const router = express.Router();

const newsLetterSubscriptionCtrl = require("../../../services/security/admin-panel-ctrl/newsLetterSubscriptionCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

//  save update navabrMenu data: http://localhost:3001/v1/newLetterSubscription/create
router.route("/create").post(newsLetterSubscriptionCtrl.create)

//  list navabrMenu data : http://localhost:3001/v1/newLetterSubscription/all-list
router.route("/all-list").get(CONFIG.JWTTOKENALLOWACCESS, newsLetterSubscriptionCtrl.allList);


module.exports = router;