require("dotenv").config();

const { admin } = require("../../models");
const utils = require("../../utils");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_KEY || "no_secret";

const register = async (req, res) => {
  const { full_name, email, phone_number, password } = req.body;
  try {
    const adminCheck = await admin.findUnique({
      where: {
        email: email,
      },
    });

    if (adminCheck) {
      return res.status(203).json({
        error: true,
        message: "Email already registered",
      });
    }

    const encryptEmail = await utils.encryptEmail(email);
    const randomOTP = Math.floor(100000 + Math.random() * 900000);

    const data = await admin.create({
      data: {
        fullName: full_name,
        email: email,
        phoneNumber: phone_number,
        password: await utils.encryptPassword(password),
        otpCode: randomOTP.toString(),
        otpExpiration: new Date(Date.now() + 5 * 60 * 1000),
        emailToken: encryptEmail,
        status: "inActive",
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: "Ruang Edukasi <system@gmail.com>",
      to: email,
      subject: "Ruang Edukasi - OTP Verification",
      html: `<p>
        To complete registration at <strong>Ruang Edukasi</strong> please input this code <br/><br/>
        <span style="background-color: #3393FF; color: white; padding: 10px; text-decoration:none; text-align: center;">${randomOTP}</span><br/><br/>
        <span>OTP valid for <strong>5</strong> minutes only</span>
        </p>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: true,
          message: err,
        });
      }

      return res.status(201).json({
        error: false,
        message: "Registration successful. Please check your email yaa",
        response: {
          verifId: data.emailToken,
        },
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const verificationOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const findData = await admin.findFirst({
      where: {
        emailToken: req.query.verification,
      },
    });

    if (!findData) {
      return res.status(500).json({
        error: true,
        message: "Verification parameter not valid",
      });
    }

    // Check OTP
    if (
      findData.otpCode === otp &&
      new Date() < new Date(findData.otpExpiration)
    ) {
      await admin.update({
        data: {
          emailToken: null,
          otpCode: null,
          otpExpiration: null,
          status: "Active",
        },
        where: {
          id: findData.id,
        },
      });

      return res.status(200).json({
        error: false,
        message: "OTP verification successful",
      });
    }

    return res.status(401).json({
      error: true,
      message: "Invalid or expired OTP",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const renewOTP = async (req, res) => {
  try {
    const findData = await admin.findFirst({
      where: {
        emailToken: req.query.verification,
      },
    });

    if (!findData) {
      return res.status(500).json({
        error: true,
        message: "Verification parameter not valid",
      });
    }

    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const data = await admin.update({
      data: {
        otpCode: randomOTP.toString(),
        otpExpiration: new Date(Date.now() + 5 * 60 * 1000), // OTP valid 5 Minutes
      },
      where: {
        id: findData.id,
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: "Ruang Edukasi <system@gmail.com>",
      to: data.email,
      subject: "Ruang Edukasi - OTP Verification",
      html: `<p>
        To complete registration at <strong>Ruang Edukasi</strong> please input this code <br/><br/>
        <span style="background-color: #3393FF; color: white; padding: 10px; text-decoration:none; text-align: center;">${randomOTP}</span><br/><br/>
        <span>OTP valid for <strong>5</strong> minutes only</span>
        </p>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: true,
          message: err,
        });
      }

      return res.status(200).json({
        error: false,
        message: "Successfully send OTP",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminCheck = await admin.findUnique({
      where: {
        email: email,
      },
    });

    // Admin not exists
    if (!adminCheck) {
      return res.status(404).json({
        error: true,
        message: "Email is not registered in our system",
      });
    }

    const activeCheck = await admin.findUnique({
      where: {
        email: email,
        status: "Active",
      },
    });

    if (!activeCheck) {
      return res.status(401).json({
        error: true,
        message: "Please activate your email first.",
      });
    }

    // Check password
    if (!(await bcrypt.compare(password, adminCheck.password))) {
      return res.status(401).json({
        error: true,
        message: "Wrong password",
      });
    }

    if (bcrypt.compareSync(password, adminCheck.password)) {
      // Create token
      const token = jwt.sign(
        { id: adminCheck.id, email: adminCheck.email },
        secretKey,
        { expiresIn: "6h" }
      );

      return res.status(200).json({
        error: false,
        message: "Login successful",
        response: {
          token,
        },
      });
    }

    return res.status(401).json({
      error: true,
      message: "Wrong password",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const verificationEmail = async (req, res) => {
  try {
    const emailTokenCheck = await admin.findFirst({
      where: {
        emailToken: req.params.key,
      },
    });

    if (!emailTokenCheck) {
      return res.status(500).json({
        error: true,
        message: "Email verification link not valid",
      });
    }

    await admin.update({
      data: {
        emailToken: null,
        status: "Active",
      },
      where: {
        id: emailTokenCheck.id,
      },
    });

    return res.status(200).json({
      error: false,
      message: "Your email successful verified.",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

module.exports = {
  register,
  verificationOTP,
  renewOTP,
  login,
  verificationEmail,
};
