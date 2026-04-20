const express = require("express");
const router = express.Router();

const inquiryRegistrationCtrl = require("../../../services/security/admin-panel-ctrl/inquiryRegistrationCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

//  save update navabrMenu data: http://localhost:3001/v1/inquiry/create
router.route("/create").post(inquiryRegistrationCtrl.create)

//  list navabrMenu data : http://localhost:3001/v1/inquiry/all-list
router.route("/all-list").get(CONFIG.JWTTOKENALLOWACCESS, inquiryRegistrationCtrl.allList);

//  list navabrMenu data : http://localhost:3001/v1/inquiry/send-emaiOn-inquiry
router.route("/send-emaiOn-inquiry").get(CONFIG.JWTTOKENALLOWACCESS, inquiryRegistrationCtrl.sendEmail);


module.exports = router;