const firebase = require("firebase-admin");
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

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
const crypto = require("crypto"); // crypto comes with Node.js

function generateSignature(apiKey, apiSecret, meetingNumber, role) {
  // Prevent time sync issue between client signature generation and zoom
  const timestamp = new Date().getTime() - 30000;
  const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString(
    "base64"
  );
  const hash = crypto
    .createHmac("sha256", apiSecret)
    .update(msg)
    .digest("base64");
  const signature = Buffer.from(
    `${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`
  ).toString("base64");

  return signature;
}

module.exports.token = async (req, res) => {
  var meetid = req.query.meetid;
  const API_KEY = "bn-IoRyCRKyi0cIaWB1hyg";
  const API_SECRET = "thgd5GsdTMIVtJO8jNYvlkwiNzWR84Elf8T6";
  var role = (
    await firebase
      .firestore()
      .collection("users")
      .doc(req.query.user)
      .collection("schools")
      .doc(req.query.school)
      .get()
  ).data().role;
  role = role == "teacher" ? 1 : 0;
  var id = generateSignature(API_KEY, API_SECRET, meetid, role);
  res.json({ id });
};

module.exports.getuser = async (req, res) => {
  var id = req.query.id;
  var user = await firebase.auth().getUser(id);
  var obj = {
    displayName: user.displayName,
    photoURL: user.photoURL,
    id: user.uid,
  };
  res.json(obj);
};
