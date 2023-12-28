const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/dashboard.controller");
const checkToken = require("../../middlewares/checkToken");

router.get("/course", checkToken, controller.ownedClass);
router.get("/course/summary", checkToken, controller.viewSummaryClass);

module.exports = router;
