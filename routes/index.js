var express = require("express");
const meet = require("../controllers/meeting");
var router = express.Router();
var school = require("../controllers/school");
var users = require("../controllers/users");
var classes = require("../controllers/class");
router.post("/newschool", school.newschool);

router.post("/joinschool", school.joinschool);

router.post("/adduser", users.adduser);
router.post("/getschools", school.getschools);
router.post("/newmeeting", meet.newMeeting);
router.post("/getmeeting", meet.getMeeting);
router.post("/allmeetings", meet.getAllMeetings);
router.get("/getuser", users.getuser);
router.get("/gettoken", users.token);
router.post("/newclass", classes.newclass);
router.post("/file", meet.uploadFile);
router.post("/joinclass", classes.joinclass);
module.exports = router;
