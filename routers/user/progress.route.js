const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/progress.controller");
const checkToken = require("../../middlewares/checkToken");

router.post(
  "/course/:courseId/content/:contentId",
  checkToken,
  controller.addCourseProgress
);

router.get("/course/:courseId", checkToken, controller.showCourseProgress);

module.exports = router;
