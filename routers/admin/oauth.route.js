const express = require("express");
const router = express.Router();
const { authorizationUrlAdmin } = require("../../utils/oauth");
const controller = require("../../controllers/admin/oauth.controller");

// Google Login
router.get("/google", (req, res) => {
  res.redirect(authorizationUrlAdmin);
});
router.post("/google", (req, res) => {
  res.redirect(authorizationUrlAdmin);
});

// Google Callback (If Login Successful)
router.get("/google/callback", controller.googleOauthCallback);

module.exports = router;
