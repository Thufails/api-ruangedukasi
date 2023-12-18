const express = require("express");
const router = express.Router();
const controller = require("../../controllers/course/search.controller");

router.get("/", controller.searchCourse);
router.get("/multi", controller.searchMultiCourse);

module.exports = router;
