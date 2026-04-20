const express = require("express");
const router = express.Router();

const akahuUserCtrl = require("../../../services/security/akahu-ctrl/akahuUserCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// category module api start

// http://localhost:3001/v1/akahu/users/getAllUserList
router.route("/users/getAllUserList").get(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.getUserAllData)

// http://localhost:3001/v1/akahu/users/all-userList
router.route("/users/all-userList").get(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.allAkahuUserList)

// for mobile
// http://localhost:3001/v1/akahu/users/getUser-details
router.route("/users/getUser-details").get(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.getUserDetails)

// http://localhost:3001/v1/akahu/users/update-user-details
router.route("/users/update-user-details").post(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.updateUserDetails)

// http://localhost:3001/v1/akahu/users/update-financial-goals
router.route("/users/update-financial-goals").post(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.updateUserFinancialGoal)

// http://localhost:3001/v1/akahu/loginMPIN
router.route("/loginMPIN").post(akahuUserCtrl.loginMPIN)

// http://localhost:3001/v1/akahu/sendOTP-forgotMPIN
router.route("/sendOTP-forgotMPIN").post(akahuUserCtrl.sendOTP)

// http://localhost:3001/v1/akahu/verifyOTP-forgotMPIN
router.route("/verifyOTP-forgotMPIN").post(akahuUserCtrl.verifyOTP)

// http://localhost:3001/v1/akahu/create-newMPIN
router.route("/create-newMPIN").put(akahuUserCtrl.mpinUpdate)

// http://localhost:3001/v1/akahu/change-MPIN
router.route("/change-MPIN").put(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.changeMPIN)

// account list
// http://localhost:3001/v1/akahu/account/all-accounts
router.route("/account/all-accounts").get(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.getAllAkahuAccounts)

// http://localhost:3001/v1/akahu/account/set-as-primary
router.route("/account/set-as-primary").get(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.setAsPrimaryAccount)

// http://localhost:3001/v1/akahu/account/loan-details
router.route("/account/loan-details").get(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.getLoanDetails)

// http://localhost:3001/v1/akahu/account/loan-upcoming-payment-update
router.route("/account/loan-upcoming-payment-update").post(CONFIG.JWTTOKENALLOWACCESS, akahuUserCtrl.updateUpcomingLoanAmount)


module.exports = router;