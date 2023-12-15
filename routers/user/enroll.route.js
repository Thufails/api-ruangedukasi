const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/enroll.controller");
const checkToken = require("../../middlewares/checkToken");

router.post("/course/:courseId", checkToken, controller.enrollCourse);

module.exports = router;
