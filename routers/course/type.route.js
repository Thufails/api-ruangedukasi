const express = require("express");
const router = express.Router();
const controller = require("../../controllers/course/type.controller");

router.get("/", controller.allType)
router.get("/premium", controller.premiumType)
router.get("/gratis", controller.gratisType);

module.exports = router;