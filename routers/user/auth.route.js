const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/auth.controller");
const checkToken = require("../../middlewares/checkToken");

router.post("/register", controller.signup);
router.post("/otp", controller.verificationOTP);
router.post("/renew-otp", controller.renewOTP);
router.get("/verification-email/:key", controller.verificationEmail);
router.post("/login", controller.login);
router.post("/reset-password", controller.resetPassword);
router.post("/set-password/:key", controller.setPassword);
router.post("/requestOTP", checkToken, controller.requestOTP);
router.post("/verifyOTP", checkToken, controller.verifyOTP);

module.exports = router;
