const express = require("express");
const router = express.Router();

const financialGoalsCtrl = require("../../../services/security/admin-panel-ctrl/financialGoalsCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

//  save update navabrMenu data: http://localhost:3001/v1/financialGoals/create
router.route("/create").post(CONFIG.JWTTOKENALLOWACCESS, financialGoalsCtrl.create)

//  save update navabrMenu data : http://localhost:3001/v1/financialGoals/update
router.route("/update").put(CONFIG.JWTTOKENALLOWACCESS, financialGoalsCtrl.update)

//  list navabrMenu data : http://localhost:3001/v1/financialGoals/all-list
router.route("/all-list").get(CONFIG.JWTTOKENALLOWACCESS, financialGoalsCtrl.allList);

//  list navabrMenu data : http://localhost:3001/v1/financialGoals/all-active-list
router.route("/all-active-list").get(CONFIG.JWTTOKENALLOWACCESS, financialGoalsCtrl.allActiveList);

//  list navabrMenu data : http://localhost:3001/v1/financialGoals/financialGoals-data-ByID
router.route("/financialGoals-data-ByID").get(CONFIG.JWTTOKENALLOWACCESS, financialGoalsCtrl.dataByID);

//  list navabrMenu data remove: http://localhost:3001/v1/financialGoals/activeDeactive
router.route("/activeDeactive").delete(CONFIG.JWTTOKENALLOWACCESS, financialGoalsCtrl.activeDeactive);


module.exports = router;