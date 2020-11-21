var express = require("express");
var app = express();
require("./config/firebase");

var path = require("path");
var cookieParser = require("cookie-parser");
const logger = require("morgan");
var fileUpload = require("express-fileupload");
var indexRouter = require("./routes/index");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use("/", indexRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/account", (req, res) => {
  res.sendFile(__dirname + "/public/pages/account.html");
});
app.get("/meet/:id", (req, res) => {
  res.sendFile(__dirname + "/public/pages/meet.html");
});
app.get("/resource/:name", (req, res) => {
  res.download(__dirname + "/public/resources/" + req.params.name);
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/pages/login.html");
});
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/pages/register.html");
});
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
