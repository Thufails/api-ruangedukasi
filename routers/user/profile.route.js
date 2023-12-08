const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/profile.controller");
const checkToken = require("../../middlewares/checkToken");
const multerLib = require("multer")();

router.get("/", checkToken, controller.list);
router.post(
  "/update",
  checkToken,
  multerLib.single("photo"),
  controller.profile
);
router.post("/change-password", checkToken, controller.changePassword);
router.get("/logout", checkToken, controller.logout);
router.post(
  "/change-avatar",
  [checkToken, express.json()],
  controller.changeAvatar
);

module.exports = router;
