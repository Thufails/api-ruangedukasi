const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/ppn.controller");

router.post("/", controller.addCoursePPN);

module.exports = router;
