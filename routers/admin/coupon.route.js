const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/coupon.controller");
const checkToken = require("../../middlewares/checkToken");

router.get("/course", checkToken, controller.allCourseCoupon);
router.get("/course/:courseId", checkToken, controller.showCourseCoupon);

module.exports = router;
