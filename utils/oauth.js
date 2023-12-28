require("dotenv").config();

// Google OAuth
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_API_URL}/api/v1/oauth/user/google/callback`
);

const oauth2ClientAdmin = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_API_URL}/api/v1/oauth/admin/google/callback`
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

const authorizationUrlAdmin = oauth2ClientAdmin.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

module.exports = {
  oauth2Client,
  oauth2ClientAdmin,
  scopes,
  authorizationUrl,
  authorizationUrlAdmin,
};
