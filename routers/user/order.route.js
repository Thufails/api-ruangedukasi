const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/order.controller");
const checkToken = require("../../middlewares/checkToken");

router.post("/course/:courseId", checkToken, controller.checkCoupon);

module.exports = router;
