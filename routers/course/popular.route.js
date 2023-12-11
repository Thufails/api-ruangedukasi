const express = require("express");
const router = express.Router();
const controller = require("../../controllers/course/popular.controller");

router.get("/", controller.popularCourse);
router.get("/:categoryId", controller.popularCourseCategory);

module.exports = router;
