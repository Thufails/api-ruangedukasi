require("dotenv").config();
// Google OAuth
const { google } = require("googleapis");
const { oauth2Client, scopes, authorizationUrl } = require("../../utils/oauth");
const { admin } = require("../../models");
const utils = require("../../utils");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_KEY || "no_secret";

const googleOauthCallback = async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code.toString());
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();

  // If data email and name empty
  if (!data.email || !data.name) {
    return res.status(200).json({
      response: data,
    });
  }

  let userExist = await admin.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!userExist) {
    // If admin not found
    const encryptEmail = await utils.encryptEmail();
    userExist = await admin.create({
      data: {
        fullName: data.name,
        email: data.email,
        password: await utils.encryptPassword(encryptEmail),
        status: "Active",
      },
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: userExist.id, email: userExist.email },
    secretKey,
    {
      expiresIn: "6h",
    }
  );

  return res.status(200).json({
    error: false,
    message: "Login successful",
    response: token,
  });
};

module.exports = {
  googleOauthCallback,
};
