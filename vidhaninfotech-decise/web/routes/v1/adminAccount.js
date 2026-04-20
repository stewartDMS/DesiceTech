const express = require("express");
const router = express.Router();

const accountAdminCtrl = require("../../../services/security/admin-panel-ctrl/accountAdminCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

//  save update navabrMenu data : http://localhost:3001/v1/admin-account/add
router.route("/add").post(accountAdminCtrl.create)

//  save update navabrMenu data : http://localhost:3001/v1/admin-account/update
router.route("/update").put(accountAdminCtrl.update)

//  list navabrMenu data : http://localhost:3001/v1/admin-account/all-list
router.route("/all-list").get(accountAdminCtrl.allList);

//  list navabrMenu data : http://localhost:3001/v1/admin-account/set-primary-account
router.route("/set-primary-account").get(accountAdminCtrl.setAsPrimaryAccount);

//  list navabrMenu data : http://localhost:3001/v1/admin-account/admin-account-data-ByID
router.route("/admin-account-data-ByID").get(accountAdminCtrl.dataByID);

//  list navabrMenu data : http://localhost:3001/v1/admin-account/primary-account-details
router.route("/primary-account-details").get(accountAdminCtrl.primaryAccountDetails);

//  list navabrMenu data remove : http://localhost:3001/v1/admin-account/delete
router.route("/delete").delete(accountAdminCtrl.delete);


module.exports = router;