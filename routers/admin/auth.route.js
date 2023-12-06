const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/auth.controller");

router.post("/register", controller.register);
router.post("/otp", controller.verificationOTP);
router.post("/renew-otp", controller.renewOTP);
router.post("/login", controller.login);
router.get("/verification-email/:key", controller.verificationEmail);
router.post("/reset-password", controller.resetPassword);
router.post("/set-password/:key", controller.setPassword);

module.exports = router;
