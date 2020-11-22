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

module.exports.token = (req, res) => {
  var id = req.query.id;

  // Substitute your Twilio AccountSid and ApiKey details
  var ACCOUNT_SID = "ACbd6943bf61b04890cb91077daea56da9";
  var API_KEY_SID = "SK3da64798018f611224f9a7f4f31e7323";
  var API_KEY_SECRET = "NmT930NRrsqKykJv8XCe8sKs5L6cuspY";

  // Create an Access Token
  var accessToken = new AccessToken(ACCOUNT_SID, API_KEY_SID, API_KEY_SECRET);

  // Set the Identity of this token
  accessToken.identity = id;

  // Grant access to Video
  var grant = new VideoGrant();
  grant.room = "";
  accessToken.addGrant(grant);

  // Serialize the token as a JWT
  var jwt = accessToken.toJwt();
  res.json({ id: jwt });
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
