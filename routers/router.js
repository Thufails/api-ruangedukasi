const express = require("express");
const router = express.Router();
const oauthAdminRouter = require("./admin/oauth.route");
const authAdminRouter = require("./admin/auth.route");
const profileAdminRouter = require("./admin/profile.route");
const dashboardAdminRouter = require("./admin/dashboard.route");
const courseAdminRouter = require("./admin/course.route");
const couponAdminRouter = require("./admin/coupon.route");
const adminOrderCourseRouter = require("./admin/order.route");
const ppnCourseRouter = require("./admin/ppn.route");
const oauthUserRouter = require("./user/oauth.route");
const authUserRouter = require("./user/auth.route");
const profileUserRouter = require("./user/profile.route");
const userOrderCourseRouter = require("./user/order.route");
const userEnrollCourseRouter = require("./user/enroll.route");
const userCouponCourseRouter = require("./user/coupon.route");
const userProgressCourseRouter = require("./user/progress.route");
const userDashboardRouter = require("./user/dashboard.route");
const categoryRouter = require("./course/category.route");
const levelRouter = require("./course/level.route");
const typeRouter = require("./course/type.route");
const courseRouter = require("./course/course.route");
const coursePopularRouter = require("./course/popular.route");
const searchCourseRouter = require("./course/search.route");
const reviewRouter = require("./course/review.router");

// Default router
router.get("/", (req, res) => {
  return res.json({
    error: false,
    statusCode: 200,
    message: "Successful access homepage API",
  });
});

// Admin
router.use("/oauth/admin", oauthAdminRouter);
router.use("/auth/admin", authAdminRouter);
router.use("/admin/profile", profileAdminRouter);
router.use("/admin/dashboard", dashboardAdminRouter);
router.use("/admin", courseAdminRouter);
router.use("/admin/coupon", couponAdminRouter);
router.use("/admin/order", adminOrderCourseRouter);
router.use("/admin/ppn", ppnCourseRouter);

// User
router.use("/oauth/user", oauthUserRouter);
router.use("/auth/user", authUserRouter);
router.use("/user/profile", profileUserRouter);
router.use("/user/order", userOrderCourseRouter);
router.use("/user/enroll", userEnrollCourseRouter);
router.use("/user/dashboard", userDashboardRouter);
router.use("/check/coupon", userCouponCourseRouter);
router.use("/progress", userProgressCourseRouter);

// Course
router.use("/category", categoryRouter);
router.use("/level", levelRouter);
router.use("/type", typeRouter);
router.use("/course", courseRouter);
router.use("/popular", coursePopularRouter);
router.use("/search", searchCourseRouter);
router.use("/review", reviewRouter);

module.exports = router;
