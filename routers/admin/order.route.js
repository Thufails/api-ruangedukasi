const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/order.controller");
const checkToken = require("../../middlewares/checkToken");

router.post("/verification/:trxId", checkToken, controller.verificationPayment);

module.exports = router;
