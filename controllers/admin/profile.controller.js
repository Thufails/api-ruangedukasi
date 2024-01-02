require("dotenv").config();

const { admin } = require("../../models");
const utils = require("../../utils");
const bcrypt = require("bcrypt");

const list = async(req, res) => {
    try {
        const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
        const data = await admin.findFirst({
            where: {
                id: jwtAdminId,
            },
        });

        delete data["password"]; // hide password field in response
        return res.status(200).json({
            error: false,
            message: "Muat profil berhasil",
            response: data,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const profile = async(req, res) => {
    const { full_name, phone_number, city, country } = req.body;
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    try {
        const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares

        let updatedData = {
            fullName: full_name,
            phoneNumber: phone_number,
            city: city,
            country: country,
        };

        if (req.file) {
            try {
                // Check filetype upload
                if (!allowedImageTypes.includes(req.file.mimetype)) {
                    return res.status(400).json({
                        error: true,
                        message: "Jenis file tidak valid",
                    });
                }

                const fileTostring = req.file.buffer.toString("base64");
                const uploadFile = await utils.imageKit.upload({
                    fileName: req.file.originalname,
                    file: fileTostring,
                });

                updatedData.imageUrl = uploadFile.url;
            } catch (error) {
                return res.status(500).json({
                    error: true,
                    message: "Terjadi kesalahan saat mengunggah gambar ke server",
                });
            }
        }

        if (Object.keys(updatedData).length === 0) {
            return res.json({
                success: true,
                message: "Tidak ada perubahan yang diperbarui",
            });
        }

        const data = await admin.update({
            where: {
                id: jwtAdminId,
            },
            data: updatedData,
        });

        delete data["password"]; // hide password field in response
        return res.status(201).json({
            error: false,
            message: "Pembaruan profil berhasil",
            response: data,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const changePassword = async(req, res) => {
    const { old_password, new_password, confirm_password } = req.body;
    try {
        const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
        const findAdmin = await admin.findUnique({
            where: {
                id: jwtAdminId,
            },
        });

        if (bcrypt.compareSync(old_password, findAdmin.password)) {
            if (new_password === confirm_password) {
                const data = await admin.update({
                    where: {
                        id: jwtAdminId,
                    },
                    data: {
                        password: await utils.encryptPassword(new_password),
                    },
                });

                delete data["password"]; // hide password field in response
                return res.status(201).json({
                    error: false,
                    message: "Ubah kata sandi berhasil",
                    response: data,
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Konfirmasi kata sandi tidak cocok",
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
};

module.exports = {
    list,
    profile,
    changePassword,
};