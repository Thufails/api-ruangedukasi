const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/course.controller");
const multer = require("../../middlewares/multer");
const multerLib = require("multer")();
const checkToken = require("../../middlewares/checkToken");

router.post(
    "/course/category",
    multerLib.single("image_url"),
    controller.addCategory
);
router.put("/course/update-category/:categoryId",
    multerLib.single("image_url"),
    controller.updateCategory
);
router.post("/course/level", controller.addLevel);
router.put("/course/update-level/:levelId", controller.updateLevel);
router.post("/course/type", controller.addType);
router.put("/course/update-type/:typeId", controller.updateType);
router.post("/course", checkToken, controller.addCourse);
router.post(
    "/course/content/:courseId",
    checkToken,
    controller.addCourseContent
);
router.post("/course/skill/:courseId", checkToken, controller.addCourseSkill);
router.post("/course/target/:courseId", checkToken, controller.addCourseTarget);
router.post("/course/coupon/:courseId", checkToken, controller.addCourseCoupon);

module.exports = router;