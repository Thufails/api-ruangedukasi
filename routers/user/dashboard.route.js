const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/dashboard.controller");
const checkToken = require("../../middlewares/checkToken");

router.get("/", checkToken, controller.profileDashboard);
router.get("/multi", checkToken, controller.dashboardSearch);

module.exports = router;
