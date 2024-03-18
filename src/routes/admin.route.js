const express = require("express");
const { getAllCandidates } = require("../controller/admin.controller");

const adminRouter = express.Router();

adminRouter.get("/all-user", getAllCandidates);

module.exports = adminRouter;
