const express = require("express");
const { handleRegister } = require("../controller/user.controller");

const router = express.Router();

router.post("/login", handleRegister);

module.exports = router;
