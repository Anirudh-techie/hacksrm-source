var firebase = require("firebase-admin");

module.exports.newclass = async (req, res) => {
  var id = (
    await firebase
      .firestore()
      .collection("schools")
      .doc(req.body.schoolid)
      .collection("classes")
      .add({ name: req.body.name })
  ).id;
  res.json({ id });
};

module.exports.joinclass = (req, res) => {
  var userid = req.body.userid;
  var classid = req.body.classid;
  var schoolid = req.body.schoolid;
  firebase
    .firestore()
    .collection("users")
    .doc(userid)
    .collection("schools")
    .doc(schoolid)
    .collection("classes")
    .doc(classid)
    .set({ data: "some data to not delete this doc" });
  res.json({});
};
