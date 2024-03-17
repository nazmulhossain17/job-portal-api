const express = require("express");
const {
  handleRegister,
  handleLogin,
} = require("../controller/user.controller");

const router = express.Router();

router.post("/create-account", handleRegister);
router.post("/login", handleLogin);

module.exports = router;
