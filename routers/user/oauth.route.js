const express = require("express");
const router = express.Router();
const { oauth2Client, scopes, authorizationUrl } = require("../../utils/oauth");
const controller = require("../../controllers/user/oauth.controller");

// Google Login
router.get("/google", (req, res) => {
  res.redirect(authorizationUrl);
});

// Google Callback (If Login Successful)
router.get("/google/callback", controller.googleOauthCallback);

module.exports = router;
