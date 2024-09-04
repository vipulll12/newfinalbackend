const express = require("express");
const router = express.Router();

const { sendMail } = require("../controller/contact");

router.post("/", sendMail);

module.exports = router;
