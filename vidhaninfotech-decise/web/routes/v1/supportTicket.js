const express = require("express");
const router = express.Router();

const supportTicketCtrl = require("../../../services/security/support-ticket-ctrl/supportTicketCtrl");
const supportTicketCatorgoryCtrl = require("../../../services/security/support-ticket-ctrl/supportTicketCatorgoryCtrl");
const CONFIG = require("../../../config");

/**
 * @description 
 * @example http://localhost:3001/v1/AdminMaster/'Route name'
 */
////Un Read Notification Count API : http://localhost:3001/v1/notification/getUnReadNotificationCount

// category module api start

// http://localhost:3001/v1/support-ticket/category/create
router.route("/category/create").post(CONFIG.JWTTOKENALLOWACCESS, supportTicketCatorgoryCtrl.create)

// http://localhost:3001/v1/support-ticket/category/update
router.route("/category/update").put(CONFIG.JWTTOKENALLOWACCESS, supportTicketCatorgoryCtrl.update)

// http://localhost:3001/v1/support-ticket/category/all-list
router.route("/category/all-list").get(supportTicketCatorgoryCtrl.allList);

// http://localhost:3001/v1/support-ticket/category/supportTicket-Category-ByID
router.route("/category/supportTicket-Category-ByID").get(CONFIG.JWTTOKENALLOWACCESS, supportTicketCatorgoryCtrl.dataByID);

// http://localhost:3001/v1/support-ticket/category/delete
router.route("/category/delete").delete(CONFIG.JWTTOKENALLOWACCESS, supportTicketCatorgoryCtrl.delete);

// category module api end

// ticket module api start

// http://localhost:3001/v1/support-ticket/create-ticket
router.route("/create-ticket").post(CONFIG.JWTTOKENALLOWACCESS, supportTicketCtrl.ticketCreate)

// http://localhost:3001/v1/support-ticket/uploadTicketFile
router.route("/uploadTicketFile").get(CONFIG.JWTTOKENALLOWACCESS, supportTicketCtrl.uploadTicketFile)

// http://localhost:3001/v1/support-ticket/reply-ticket
router.route("/reply-ticket").post(CONFIG.JWTTOKENALLOWACCESS, supportTicketCtrl.ticketReply)

// http://localhost:3001/v1/support-ticket/close-ticket
router.route("/close-ticket").get(CONFIG.JWTTOKENALLOWACCESS, supportTicketCtrl.closeSupportTicket)

// http://localhost:3001/v1/support-ticket/get-ticket-data-fAdmin
router.route("/get-ticket-data-fAdmin").get(CONFIG.JWTTOKENALLOWACCESS, supportTicketCtrl.getTicketDataForAdmin)

// http://localhost:3001/v1/support-ticket/get-ticket-data-fMobile
router.route("/get-ticket-data-fMobile").get(CONFIG.JWTTOKENALLOWACCESS, supportTicketCtrl.getTicketDataForMobile)

// ticket module api end


module.exports = router;