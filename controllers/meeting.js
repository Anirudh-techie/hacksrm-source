const firebase = require("firebase-admin");
var jwtGenerator = require("jsonwebtoken");
const path = require("path");

module.exports.getAllMeetings = async (req, res) => {
  var response = [];
  var id = req.body.class;
  if(id.includes("all:::")){
var meetings = await firebase
  .firestore()
  .collection("meetings")
  .where("schoolid", "==", id.substring(6,id.length))
  .get();
  }else{
var meetings = await firebase
  .firestore()
  .collection("meetings")
  .where("class", "==", id)
  .get();
  }
  
  meetings.forEach((v) => {
    var data = v.data();
    var obj = { id: v.id, ...data };
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
  var http = require("https");
var expiry = new Date();
expiry.setHours(expiry.getHours() + 1);
var jwt = jwtGenerator.sign(
  {
    aud: null,
    iss: "bn-IoRyCRKyi0cIaWB1hyg",
    exp: parseInt(expiry.getTime() / 1000),
    iat: parseInt(new Date().getTime() / 1000),
  },
  "thgd5GsdTMIVtJO8jNYvlkwiNzWR84Elf8T6"
);
  var options = {
    method: "POST",
    hostname: "api.zoom.us",
    port: null,
    path: "/v2/users/RRYqidJ7SiCa7iY1Dq-wig/meetings",
    headers: {
      "content-type": "application/json",
      authorization:
        "Bearer "+jwt,
    },
  };

  var request = http.request(options, function (response) {
    var chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", async function () {
      var body = Buffer.concat(chunks);
      body = body.toString();
      body = JSON.parse(body);
      await firebase
        .firestore()
        .collection("meetings")
        .doc(body.id.toString())
        .set({
          name: req.body.name,
          schoolid: req.body.schoolid,
          class: req.body["class"],
          resources: [],
        });
      res.json({ id: body.id });
    });
  });

  request.write(
    JSON.stringify({
      topic: req.body.name,
      type: 3,
      password: "password",
      agenda: req.body.name + "for" + req.body.class,
      settings: {
        host_video: true,
        participant_video: true,
        in_meeting: true,
        mute_upon_entry: false,
        watermark: false,
        use_pmi: false,
        approval_type: 0,
        audio: "both",
        auto_recording: "none",
      },
    })
  );
  request.end();
};

module.exports.getMeeting = async (req, res) => {
  var m = await firebase
    .firestore()
    .collection("meetings")
    .doc(req.body.id)
    .get();
  var d = m.data();
  var id = m.id;
  res.json({
    id,
    ...d,
  });
};
