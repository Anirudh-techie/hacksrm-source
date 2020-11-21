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
  var schoolprop = await firebase
    .firestore()
    .collection("schools")
    .doc(req.body.schoolid)
    .get();
  var name = schoolprop.data().name;
  var id = schoolprop.id;
  var role = req.body.role;
  await firebase
    .firestore()
    .collection("users")
    .doc(req.body.userid)
    .collection("schools")
    .doc(req.body.schoolid)
    .set({
      name,
      id,
      role,
    });
  res.json({});
};

module.exports.getschools = async (req, res) => {
  var response = [];
  var schools = await firebase
    .firestore()
    .collection("users")
    .doc(req.body.userid)
    .collection("schools")
    .get();
  schools.docs.forEach((v) => {
    response.push(v.data());
  });
  res.json(response);
};
