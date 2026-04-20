const express = require("express");
const router = express.Router();

const adminUserCtrl = require("../../../services/security/admin-panel-ctrl/adminUserCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// http://localhost:3001/v1/adminAuth/register
router.route("/register").post(CONFIG.JWTTOKENALLOWACCESS, adminUserCtrl.createAdminUser);

// http://localhost:3001/v1/adminAuth/update-user-details
router.route("/update-user-details").put(CONFIG.JWTTOKENALLOWACCESS, adminUserCtrl.updateAdminUser);

// http://localhost:3001/v1/adminAuth/getAdminUser-details-byID
router.route("/getAdminUser-details-byID").get(CONFIG.JWTTOKENALLOWACCESS, adminUserCtrl.getAdminUserByID);

// http://localhost:3001/v1/adminAuth/getAll-AdminUser-List
router.route("/getAll-AdminUser-List").get(CONFIG.JWTTOKENALLOWACCESS, adminUserCtrl.getAllAdminUserList);

// http://localhost:3001/v1/adminAuth/login
router.route("/login").post(adminUserCtrl.login);

// http://localhost:3001/v1/adminAuth/send-otp
router.route("/send-otp").post(adminUserCtrl.sendOTP);

// http://localhost:3001/v1/adminAuth/verify-otp
router.route("/verify-otp").post(adminUserCtrl.verifyOTP);

// http://localhost:3001/v1/adminAuth/password-update
router.route("/password-update").put(adminUserCtrl.passwordUpdate);

// http://localhost:3001/v1/adminAuth/change-password
router.route("/change-password").put(CONFIG.JWTTOKENALLOWACCESS, adminUserCtrl.changePassword);


module.exports = router;