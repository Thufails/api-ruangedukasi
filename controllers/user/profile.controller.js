require("dotenv").config();

const { user } = require("../../models");
const utils = require("../../utils");
const bcrypt = require("bcrypt");

const list = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const data = await user.findFirst({
      where: {
        id: jwtUserId,
      },
    });

    delete data["password"]; // hide password field in response
    return res.status(201).json({
      error: false,
      message: "Load profile successful",
      response: data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const profile = async (req, res) => {
  const { full_name, phone_number, city, country } = req.body;
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares

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
            message:
              "Invalid file type. Only JPEG, PNG, and GIF images are allowed.",
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
          message: "Error uploading image to server",
        });
      }
    }

    if (Object.keys(updatedData).length === 0) {
      return res.json({
        success: true,
        message: "No changes provided for update.",
      });
    }

    const data = await user.update({
      where: {
        id: parseInt(jwtUserId),
      },
      data: updatedData,
    });

    delete data["password"]; // hide password field in response
    return res.status(201).json({
      error: false,
      message: "Update profile successful",
      response: data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const changePassword = async (req, res) => {
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
          message: "Change password successful",
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
      message: "Your old password is wrong",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: "Logout failed",
        });
      }
      res.status(200).json({
        error: false,
        message: "Logout successful",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
};

const changeAvatar = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const { newAvatarUrl } = req.body;

    // Implement logic update avatar URL di database
    await user.update({
      where: {
        id: jwtUserId,
      },
      data: {
        imageUrl: newAvatarUrl,
      },
    });

    return res.status(200).json({
      error: false,
      message: "Avatar updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  list,
  profile,
  changePassword,
  logout,
  changeAvatar,
};
