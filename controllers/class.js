var firebase = require("firebase-admin");

module.exports.newclass = (req, res) => {
  firebase
    .firestore()
    .collection("schools")
    .doc(req.body.schoolid)
    .collection("classes")
    .add({ name: req.body.name });
  res.json();
};

module.exports.getallclasses = (req, res) => {
  firebase
    .firestore()
    .collection("schools")
    .doc(req.query.schoolid)
    .collection("classes")
    .get()
    .then((d) => {
      res.write("[");
      d.docs.forEach((v) => {
        var h = {
          id: v.id,
          ...v.data(),
        };
        res.write(JSON.stringify(h));
      });
      res.write("]");
      res.end();
    });
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
