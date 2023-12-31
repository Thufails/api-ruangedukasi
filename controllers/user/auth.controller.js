require("dotenv").config();

const { user } = require("../../models");
const utils = require("../../utils");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const secretKey = process.env.JWT_KEY || "no_secret";

module.exports = {
    signup: async(req, res) => {
        // Endpoint SignUp (SignUp)
        const { full_name, email, phone_number, password } = req.body;
        try {
            const userCheck = await user.findUnique({
                where: { email: email },
            });

            if (userCheck) {
                return res.status(203).json({
                    error: true,
                    message: "Email sudah terdaftar",
                });
            }

            const encryptEmail = await utils.encryptEmail(email);
            const randomOTP = Math.floor(100000 + Math.random() * 900000);

            const data = await user.create({
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
                html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <link rel="preconnect" href="https://fonts.gstatic.com">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="=stylesheet">
          <style>
              body {
                margin: 0;
                font-size: 14px;
                font-weight: 400;
                line-height: 24px;
                font-family: Inter, system-ui, Helvetica, Arial, sans-serif
              }

              strong {
                font-weight: 600
              }

              .container {
                width: 600px;
                padding: 60px 60px 32px;
                margin: 24px auto;
                box-sizing: border-box;
                border: 1px solid #ededed
              }

              .learning-center {
                color: #212121;
                text-decoration: underline
              }

              a:hover {
                text-decoration: underline
              }

              a.btn {
                font-size: 12px;
                padding: 8px 12px;
                text-decoration: none;
                background-color: #ff6c37;
                border-radius: 4px;
                color: #fff
              }

              a.primary {
                text-decoration: underline;
                color: #000
              }

              span.secondary {
                color: #707070
              }

              header {
                margin-bottom: 32px
              }

              header img#logo {
                width: 142px
              }

              #call-to-action {
                margin-top: 16px;
                margin-bottom: 16px
              }

              #message {
                width: 480px;
                color: #212121;
                margin-bottom: 24px
              }

              .email-content {
                font-weight: 400;
                font-size: 14px
              }

              .introduction {
                font-size: 14px
              }

              .announcement {
                letter-spacing: -.56px;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px
              }

              h3 {
                margin-top: 32px;
                margin-bottom: 8px
              }

              ul {
                padding-left: 20px;
                margin-top: 0;
                margin-bottom: 16px
              }
          </style>
        </head>

        <body
          style="margin:0;font-size:14px;font-weight:400;line-height:24px;font-family:Inter,system-ui,Helvetica,Arial,sans-serif">
          <div class="container"
              style="width:600px;padding:60px 60px 32px;margin:24px auto;box-sizing:border-box;border:1px solid #ededed">
              <header style="margin-bottom:32px">
                <img id="logo" src="https://ik.imagekit.io/whywidodo/ruang-edukasi.png" alt="Ruang Edukasi Logo"
                    style="width: 250px; height: 80px;">
                    <p style="border-top:solid 1px #ededed;font-size:1px;margin:0 auto;width:100%"></p>
              </header>
              <section id="message" style="width:480px;color:#212121;margin-bottom:24px">
                <div class="email-content" style="font-weight:400;font-size:14px">
                    <h2 class="announcement" style="letter-spacing:-.56px;font-size:18px;font-weight:600;margin-bottom:20px">
                      Verifikasi OTP</h2>
                    <div class="introduction" style="font-size:14px;">Halo ${data.fullName},
                      <p>Untuk menyelesaikan pendaftaran di <strong>Ruang Edukasi</strong> silahkan masukan kode dibawah ini pada halaman verifikasi OTP.</p>
                      <span style="font-weight:700;font-size:12px;padding:8px 12px;text-decoration:none;background-color:#6148FF;border-radius:4px;color:#fff">${randomOTP}</span>
                      <p><i style="color: #FF3E37;">Kode OTP hanya berlaku selama 5 menit!</i></p>
                    </div>
                </div>
              </section>
              <table style="width:100%">
                <tbody>
                    <tr>
                      <td align="center" style="font-size:0;padding:0 0 16px;word-break:break-word">
                          <p style="border-top:solid 1px #ededed;font-size:1px;margin:0 auto;width:100%"></p>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0;padding:0;word-break:break-word">
                          <div
                            style="font-family:Inter,Segoe UI,Roboto,Arial,verdana,geneva,sans-serif;font-size:12px;font-style:normal;font-weight:400;line-height:20px;text-align:left;color:#999999">
                            &copy; 2023 Ruang Edukasi</div>
                      </td>
                    </tr>
                </tbody>
              </table>
          </div>
        </body>

        </html>
        `,
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
                    message: "Pendaftaran berhasil. Silakan periksa email Anda",
                    response: {
                        verifId: data.emailToken,
                        verifEmail: data.email,
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
    },

    verificationEmail: async(req, res) => {
        try {
            const findData = await user.findFirst({
                where: {
                    emailToken: req.params.key,
                },
            });
            if (!findData) {
                return res.status(500).json({
                    error: true,
                    message: "Tautan verifikasi email tidak valid",
                });
            }

            await user.update({
                data: {
                    emailToken: null,
                    status: "Active",
                },
                where: {
                    id: findData.id,
                },
            });

            return res.status(200).json({
                error: false,
                message: "Email Anda berhasil diverifikasi.",
            });
        } catch (error) {
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },

    verificationOTP: async(req, res) => {
        try {
            const { otp } = req.body;
            const findData = await user.findFirst({
                where: {
                    emailToken: req.query.verification,
                },
            });

            if (!findData) {
                return res.status(500).json({
                    error: true,
                    message: "Parameter verifikasi tidak valid",
                });
            }

            // Check OTP
            if (
                findData.otpCode === otp &&
                new Date() < new Date(findData.otpExpiration)
            ) {
                await user.update({
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

                const token = jwt.sign({ id: findData.id, email: findData.email },
                    secretKey, {
                        expiresIn: "6h",
                    }
                );

                return res.status(200).json({
                    error: false,
                    message: "Verifikasi OTP berhasil",
                    response: {
                        token,
                    },
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
    },

    renewOTP: async(req, res) => {
        try {
            const findData = await user.findFirst({
                where: {
                    emailToken: req.query.verification,
                },
            });

            if (!findData) {
                return res.status(500).json({
                    error: true,
                    message: "Parameter verifikasi tidak valid",
                });
            }

            const randomOTP = Math.floor(100000 + Math.random() * 900000);
            const data = await user.update({
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
                    message: "Berhasil mengirim OTP",
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },

    login: async(req, res) => {
        // Endpoint Login (LogIn)
        try {
            const { email, password } = req.body;

            const userCheck = await user.findUnique({
                where: {
                    email: email,
                },
            });

            // User not exists
            if (!userCheck) {
                return res.status(404).json({
                    error: true,
                    message: "Email tidak terdaftar di sistem kami",
                });
            }

            const activeCheck = await user.findUnique({
                where: {
                    email: email,
                    status: "Active",
                },
            });

            if (!activeCheck) {
                return res.status(401).json({
                    error: true,
                    message: "Silakan aktifkan email Anda terlebih dahulu.",
                });
            }

            // Check password
            if (!(await bcrypt.compare(password, userCheck.password))) {
                return res.status(401).json({
                    error: true,
                    message: "password salah",
                });
            }

            const token = jwt.sign({ id: userCheck.id, email: userCheck.email },
                secretKey, {
                    expiresIn: "6h",
                }
            ); // Generate JWT token

            return res.status(200).json({
                error: false,
                message: "Login berhasil",
                response: {
                    token,
                },
            });
        } catch (error) {
            console.error("Error in login:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    resetPassword: async(req, res) => {
        // Endpoint Reset Password (POST /resetpw)
        try {
            const { email } = req.body;

            // Cek apakah pengguna dengan email tersebut ada di database
            const userCheck = await user.findUnique({
                where: { email: email },
            });

            if (!userCheck) {
                return res.status(404).json({
                    error: true,
                    message: "Email tidak ditemukan",
                });
            }

            const encryptPassword = await utils.encryptEmail();
            const data = await user.update({
                data: {
                    passwordToken: encryptPassword,
                    otpExpiration: new Date(Date.now() + 5 * 60 * 1000),
                },
                where: {
                    email: email,
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
                subject: "Ruang Edukasi - Reset Password",
                html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <link rel="preconnect" href="https://fonts.gstatic.com">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="=stylesheet">
          <style>
              body {
                margin: 0;
                font-size: 14px;
                font-weight: 400;
                line-height: 24px;
                font-family: Inter, system-ui, Helvetica, Arial, sans-serif
              }

              strong {
                font-weight: 600
              }

              .container {
                width: 600px;
                padding: 60px 60px 32px;
                margin: 24px auto;
                box-sizing: border-box;
                border: 1px solid #ededed
              }

              .learning-center {
                color: #212121;
                text-decoration: underline
              }

              a:hover {
                text-decoration: underline
              }

              a.btn {
                font-size: 12px;
                padding: 8px 12px;
                text-decoration: none;
                background-color: #ff6c37;
                border-radius: 4px;
                color: #fff
              }

              a.primary {
                text-decoration: underline;
                color: #000
              }

              span.secondary {
                color: #707070
              }

              header {
                margin-bottom: 32px
              }

              header img#logo {
                width: 142px
              }

              #call-to-action {
                margin-top: 16px;
                margin-bottom: 16px
              }

              #message {
                width: 480px;
                color: #212121;
                margin-bottom: 24px
              }

              .email-content {
                font-weight: 400;
                font-size: 14px
              }

              .introduction {
                font-size: 14px
              }

              .announcement {
                letter-spacing: -.56px;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px
              }

              h3 {
                margin-top: 32px;
                margin-bottom: 8px
              }

              ul {
                padding-left: 20px;
                margin-top: 0;
                margin-bottom: 16px
              }
          </style>
        </head>

        <body
          style="margin:0;font-size:14px;font-weight:400;line-height:24px;font-family:Inter,system-ui,Helvetica,Arial,sans-serif">
          <div class="container" style="width:600px;padding:60px 60px 32px;margin:24px auto;box-sizing:border-box;border:1px solid #ededed">
              <header style="margin-bottom:32px">
                <img id="logo" src="https://ik.imagekit.io/whywidodo/ruang-edukasi.png" alt="Ruang Edukasi Logo"
                    style="width: 250px; height: 80px;">
                <p style="border-top:solid 1px #ededed;font-size:1px;margin:0 auto;width:100%"></p>
              </header>
              <section id="message" style="width:480px;color:#212121;margin-bottom:24px">
                <div class="email-content" style="font-weight:400;font-size:14px">
                    <h2 class="announcement" style="letter-spacing:-.56px;font-size:18px;font-weight:600;margin-bottom:20px">Reset Password</h2>
                    <div class="introduction" style="font-size:14px;">Halo ${userCheck.fullName},
                      <p>Untuk melanjutkan proses perubahan password, silahkan tekan tombol di bawah ini.</p>
                      <a href="${process.env.HOST}/user/reset/${encryptPassword}"
                          target="_blank" class="btn" style="font-weight:700;font-size:12px;padding:8px 12px;text-decoration:none;background-color:#6148FF;border-radius:4px;color:#fff">
                                      Ganti Password</a>
                      <p><i style="color: #FF3E37;">Link reset password hanya berlaku 5 menit!</i><br/>
                      Abaikan pesan ini, apabila kamu tidak meminta perubahan password!</p>
                    </div>
                </div>
              </section>
              <table style="width:100%">
                <tbody>
                    <tr>
                      <td align="center" style="font-size:0;padding:0 0 16px;word-break:break-word">
                          <p style="border-top:solid 1px #ededed;font-size:1px;margin:0 auto;width:100%"></p>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0;padding:0;word-break:break-word">
                          <div
                            style="font-family:Inter,Segoe UI,Roboto,Arial,verdana,geneva,sans-serif;font-size:12px;font-style:normal;font-weight:400;line-height:20px;text-align:left;color:#999999">
                                &copy; 2023 Ruang Edukasi</div>
                      </td>
                    </tr>
                </tbody>
              </table>
          </div>
        </body>

        </html>
        `,
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
                    message: "Tautan reset password berhasil dikirim. Silakan periksa email Anda",
                });
            });
        } catch (error) {
            console.error("Error in resetPassword:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    setPassword: async(req, res) => {
        try {
            const { password, confirm_password } = req.body;
            const findUser = await user.findFirst({
                where: {
                    passwordToken: req.params.key,
                },
            });

            if (!findUser) {
                return res.status(403).json({
                    error: true,
                    message: "Tautan reset password tidak valid",
                });
            }
            if (!(new Date() < new Date(findUser.otpExpiration))) {
                return res.status(401).json({
                    error: true,
                    message: "Tautan reset kata sandi sudah tidak berlaku lagi",
                });
            }

            if (password !== confirm_password) {
                return res.status(403).json({
                    error: true,
                    message: "Konfirmasi kata sandi tidak cocok",
                });
            }

            const data = await user.update({
                where: {
                    id: findUser.id,
                },
                data: {
                    password: await utils.encryptPassword(password),
                    passwordToken: null,
                    otpExpiration: null,
                },
            });

            if (data) {
                return res.status(200).json({
                    error: false,
                    message: "kata sandi berhasil diubah",
                });
            }

            return res.status(200).json({
                error: true,
                message: "Gagal mengatur ulang kata sandi",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error,
            });
        }
    },

    changePassword: async(req, res) => {
        // Endpoint Set Password (POST /setpw)
        const { old_password, new_password, confirm_password } = req.body;
        try {
            const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
            const findUser = await user.findUnique({
                where: {
                    id: jwtUserId,
                },
            });

            if (bcrypt.compareSync(old_password, findUser.password)) {
                if (new_password === confirm_password) {
                    const data = await user.update({
                        where: {
                            id: jwtUserId,
                        },
                        data: {
                            password: await utils.encryptPassword(new_password),
                        },
                    });

                    delete data["password"]; // hide password field in response
                    return res.status(200).json({
                        error: false,
                        message: "Ubah kata sandi berhasil",
                        response: data,
                    });
                } else {
                    return res.status(403).json({
                        error: true,
                        message: "The password confirmation does not match",
                    });
                }
            }

            return res.status(403).json({
                error: true,
                message: "Kata sandi lama Anda salah",
            });
        } catch (error) {
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },

    requestOTP: async(req, res) => {
        // Endpoint Request OTP (POST /requestOTP)
        try {
            const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
            // Generate OTP
            const generatedOTP = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: true,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            // Simpan OTP ke database atau cache
            await user.update({
                where: { id: jwtUserId },
                data: {
                    otpCode: generatedOTP,
                    otpExpiration: new Date(Date.now() + 5 * 60 * 1000), // OTP valid 5 Minutes
                },
            });

            return res.json({
                error: false,
                message: "OTP berhasil dihasilkan",
            });
        } catch (error) {
            console.error("Error in requestOTP:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    verifyOTP: async(req, res) => {
        // Endpoint Verifikasi (POST /verifyOTP)
        const { otp } = req.body;
        try {
            const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
            const userCheck = await user.findUnique({
                where: {
                    id: jwtUserId,
                },
            });

            if (!userCheck) {
                return res.status(404).json({
                    error: true,
                    message: "Pengguna tidak ditemukan",
                });
            }

            // Cek apakah OTP sesuai
            if (
                userCheck.otpCode === otp &&
                new Date() < new Date(userCheck.otpExpiration)
            ) {
                // Reset OTP fields
                await user.update({
                    where: { id: jwtUserId },
                    data: { otpCode: null, otpExpiration: null },
                });

                return res.json({
                    message: "Verifikasi OTP berhasil",
                });
            } else {
                return res.status(401).json({
                    error: true,
                    message: "OTP tidak valid atau kadaluwarsa",
                });
            }
        } catch (error) {
            console.error("Error in verifyOTP:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};