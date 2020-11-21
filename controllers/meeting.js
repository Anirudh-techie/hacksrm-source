const firebase = require("firebase-admin");
const path = require("path");

const WebSocket = require("ws");
// based on examples at https://www.npmjs.com/package/ws
const WebSocketServer = WebSocket.Server;

module.exports.getAllMeetings = async (req, res) => {
  var response = [];
  var schoolid = req.body.id;
  var grade = req.body.grade;
  var meetings = await firebase
    .firestore()
    .collection("meetings")
    .where("schoolid", "==", schoolid)
    .where("grade", "==", grade)
    .get();
  meetings.forEach((v) => {
    var data = v.data();
    var obj = { id: v.id, name: data.name, grade: data.grade };
    response.push(obj);
  });
  res.json(response);
};

module.exports.uploadFile = async (req, res) => {
  var url = "";
  if (req.files) {
    if (req.files.resource) {
      url = path.resolve(
        path.join(__dirname, "../public/resources/", req.files.resource.name)
      );
      await req.files.resource.mv(url);
      url = "/resources/" + req.files.resource.name;
    }
  } else if (req.body.website) {
    url = req.body.website;
  }
  await firebase
    .firestore()
    .collection("meetings")
    .doc(req.body.meetingId)
    .update({
      resources: firebase.firestore.FieldValue.arrayUnion({
        name: req.body.name,
        url,
      }),
    });
};

module.exports.newMeeting = async (req, res) => {
  var id = await firebase.firestore().collection("meetings").add({
    name: req.body.name,
    schoolid: req.body.schoolid,
    grade: req.body.grade,
    resources: [],
  });
  id = id.id;
  res.json({ id });
  var server = require("../bin/www").server;
  // Create a server for handling websocket calls
  const wss = new WebSocketServer({ server, path: "/websocket/" + id });

  wss.on("connection", function (ws) {
    ws.on("message", function (message) {
      // Broadcast any received message to all clients
      wss.broadcast(message);
    });

    ws.on("error", () => ws.terminate());
  });

  wss.broadcast = function (data) {
    this.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
};

module.exports.getMeeting = async (req, res) => {
  var m = await firebase
    .firestore()
    .collection("meetings")
    .doc(req.body.id)
    .get();
  var d = m.data();
  var { name, grade } = d;
  var id = m.id;
  res.json({
    name,
    id,
    grade,
  });
};
