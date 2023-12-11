const express = require("express");
const router = express.Router();
const controller = require("../../controllers/course/review.controller");
const checkToken = require("../../middlewares/checkToken");

router.get("/course/:courseId", controller.getCourseReviews);
router.post("/course/:courseId", checkToken, controller.addCourseReview);

module.exports = router;
