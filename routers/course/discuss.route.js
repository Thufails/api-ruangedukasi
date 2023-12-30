const express = require("express");
const router = express.Router();
const controller = require("../../controllers/course/discussion.controller");

router.get("/course/:courseId", controller.getCourseDiscussions);
router.post("/course/:courseId/comment", controller.addDiscussionComment);
router.post("/comment/:commentId/reply", controller.addReplyToComment);

module.exports = router;