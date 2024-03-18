const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.route");
const adminRouter = require("./src/routes/admin.route");
const PORT = 5000;
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/auth", userRouter);
app.use("/api/admin", adminRouter);
app.get("/", (req, res) => {
  res.send("working");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
