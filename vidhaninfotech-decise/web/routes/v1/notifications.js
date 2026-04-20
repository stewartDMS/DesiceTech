const express = require("express");
const router = express.Router();
const NotificationCtrl = require("../../../services/security/notification-ctrl/notificationCtrl");
const CONFIG = require("../../../config");

/**
 * @description Post routes
 * @example http://localhost:3000/v1/notification/'Route name'
 */

//Send Request API : http://localhost:3001/v1/notification/getNotification
router.route("/getNotification").get(CONFIG.JWTTOKENALLOWACCESS, NotificationCtrl.notificationDataMobile);

//Un Read Notification Count API : http://localhost:3001/v1/notification/viewedNotifications
router.route("/viewedNotifications").get(CONFIG.JWTTOKENALLOWACCESS, NotificationCtrl.viewedNotifications);

//Un Read Notification Count API : http://localhost:3001/v1/notification/readNotificationsAll
router.route("/readNotificationsAll").get(CONFIG.JWTTOKENALLOWACCESS, NotificationCtrl.readNotificationsAll);

//Un Read Notification Count API : http://localhost:3001/v1/notification/readNotification
router.route("/readNotification").get(CONFIG.JWTTOKENALLOWACCESS, NotificationCtrl.readNotification);

// http://localhost:3001/v1/notification/reminder
router.route("/reminder").post(CONFIG.JWTTOKENALLOWACCESS, NotificationCtrl.remindNotification);

// http://localhost:3001/v1/notification/getAdminNotification
router.route("/getAdminNotification").get(CONFIG.JWTTOKENALLOWACCESS, NotificationCtrl.getAdminNotification);

module.exports = router;
