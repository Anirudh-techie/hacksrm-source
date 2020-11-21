const firebase = require("firebase-admin");
module.exports.adduser = (req, res) => {
  firebase
    .firestore()
    .collection("users")
    .doc(req.body.userid)
    .set({ name: req.body.name })
    .then(() => {
      res.json({});
    });
};
