const express = require("express");
const router = express.Router();

const monitizationCtrl = require("../../../services/security/admin-panel-ctrl/monitizationCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

//  save update navabrMenu data: http://localhost:3001/v1/monitization/add
router.route("/add").post(CONFIG.JWTTOKENALLOWACCESS, monitizationCtrl.create)

//  save update navabrMenu data : http://localhost:3001/v1/monitization/update
router.route("/update").put(CONFIG.JWTTOKENALLOWACCESS, monitizationCtrl.update)

//  list navabrMenu data : http://localhost:3001/v1/monitization/all-list
router.route("/all-list").get(CONFIG.JWTTOKENALLOWACCESS, monitizationCtrl.allList);

//  list navabrMenu data : http://localhost:3001/v1/monitization/list-of-monitization
router.route("/list-of-monitization").get(monitizationCtrl.listOfMonitization);

//  list navabrMenu data : http://localhost:3001/v1/monitization/range-wise-list
router.route("/range-wise-list").get(CONFIG.JWTTOKENALLOWACCESS, monitizationCtrl.rangeWiseList);

//  list navabrMenu data : http://localhost:3001/v1/monitization/monitization-data-ByID
router.route("/monitization-data-ByID").get(CONFIG.JWTTOKENALLOWACCESS, monitizationCtrl.dataByID);

//  list navabrMenu data remove: http://localhost:3001/v1/monitization/delete
router.route("/delete").delete(CONFIG.JWTTOKENALLOWACCESS, monitizationCtrl.delete);


module.exports = router;