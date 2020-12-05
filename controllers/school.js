const firebase = require("firebase-admin");

module.exports.newschool = async (req, res) => {
  res.json({
    id: await firebase
      .firestore()
      .collection("schools")
      .add({ name: req.body.name })
      .then((d) => d.id),
  });
};

module.exports.joinschool = async (req, res) => {
  var role = req.body.role;
  await firebase
    .firestore()
    .collection("users")
    .doc(req.body.userid)
    .collection("schools")
    .doc(req.body.schoolid)
    .set({
      id: req.body.schoolid,
      role,
    });
  res.json({});
};

module.exports.getschools = async (req, res) => {
  console.time("my schools");
  var response = [];
  var myschoolsref = firebase
    .firestore()
    .collection("users")
    .doc(req.body.userid)
    .collection("schools");

  var schools = await myschoolsref.get();
  console.timeEnd("my schools");
  for (var [i, v] of schools.docs.entries()) {
    console.time("school number:" + i);
    var schoolref = firebase.firestore().collection("schools").doc(v.id);
    var k = await schoolref.get();
    var d = k.data();
    var _allclasses_ = [];
    console.timeEnd("school number:" + i);
    console.time("classes");
    firebase
      .firestore()
      .collection("schools")
      .doc(v.id)
      .collection("classes")
      .get()
      .then((d) => {
        d.docs.forEach((g) => {
          var h = {
            id: g.id,
            ...g.data(),
          };
          _allclasses_.push(h);
        });
      });
    var classes = await myschoolsref.doc(v.id).collection("classes").get();
    var _classes_ = [];
    console.timeEnd("classes");
    for (var c of classes.docs) {
      console.time("my class");
      var id = c.id;
      var c_data = (await schoolref.collection("classes").doc(id).get()).data();
      c_data.meetings = [];
      var meetings = await firebase
        .firestore()
        .collection("meetings")
        .where("class", "==", id)
        .get();
      meetings.forEach((s) => {
        c_data.meetings.push({ id: s.id, ...s.data() });
      });
      _classes_.push(c_data);
      console.timeEnd("my class");
    }
    var r = {
      id: v.id,
      ...v.data(),
      ...d,
      classes: _classes_,
      allclasses: _allclasses_,
    };
    response.push(r);
  }
  res.json(response);
};
