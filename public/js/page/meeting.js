import * as auth from "../util/auth.js";
import * as button from "../util/button.js";
var meeting;
var meetId = "";
var accessToken;

export var init = async () => {
  var paths = location.pathname.split("/");
  paths = paths.filter(
    (v) => v != "" && typeof v !== "undefined" && v.trim() != ""
  );
  var id = paths[paths.length - 1];
  meetId = id;
  var details = await getMeeting(id);
  accessToken = (
    await (
      await fetch(
        "/gettoken?user=" +
          auth.user.uid +
          "&meetid=" +
          meetId +
          "&school=" +
          details["schoolid"]
      )
    ).json()
  ).id;
  var page1 = `
  <h1 style='color:#444'>${details.name}</h1>
  <h5 style='color:#444'>for ${details.class}</h5>
  <button id='join-meet'>join</button>
  <div id='localvideo'></div>
  `;
  document.getElementById("main").innerHTML = page1;
  button.init();
  window.b = button.init;
  document.getElementById("join-meet").onclick = joinMeeting;
};
export let getMeeting = async (id) => {
  return await (
    await fetch("/getmeeting", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    })
  ).json();
};

function joinMeeting() {
  console.log(accessToken);
  var scripts = [
    "https://source.zoom.us/1.8.1/lib/vendor/react.min.js",
    "https://source.zoom.us/1.8.1/lib/vendor/react-dom.min.js",
    "https://source.zoom.us/1.8.1/lib/vendor/redux.min.js",
    "https://source.zoom.us/1.8.1/lib/vendor/redux-thunk.min.js",
    "https://source.zoom.us/1.8.1/lib/vendor/lodash.min.js",
    "https://source.zoom.us/zoom-meeting-1.8.1.min.js",
  ];
  document.head.innerHTML += `
  <link type="text/css" rel="stylesheet" href="https://source.zoom.us/1.8.1/css/bootstrap.css" />
  <link type="text/css" rel="stylesheet" href="https://source.zoom.us/1.8.1/css/react-select.css" />
  <link rel="stylesheet" href="/css/meet.css">
  `;
  scripts.forEach((s, i) => {
    var scriptEl = document.createElement("script");
    scriptEl.src = s;
    scriptEl.defer = true;
    document.body.append(scriptEl);
    if (i + 1 == scripts.length) {
      scriptEl.onload = () => {
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareJssdk();
        ZoomMtg.init({
          leaveUrl: "/index.html",
          isSupportAV: true,
          success: function () {
            ZoomMtg.join({
              signature: accessToken,
              apiKey: "bn-IoRyCRKyi0cIaWB1hyg",
              meetingNumber: meetId,
              userName: auth.user.displayName,
              passWord: "password",
            });
          },
        });
      };
    }
  });
  document.getElementById("main").innerHTML = ``;
}

function muteAudio(room) {
  room.localParticipant.audioTracks.forEach((publication) => {
    publication.track.disable();
  });
}
function muteVideo(room) {
  room.localParticipant.videoTracks.forEach((publication) => {
    publication.track.disable();
  });

  document.getElementById("localvideo").style.display = "none";
  document.getElementById("localimg").style.display = "inline-block";
}

function unmuteAudio(room) {
  room.localParticipant.audioTracks.forEach((publication) => {
    publication.track.enable();
  });
}
function unmuteVideo(room) {
  room.localParticipant.videoTracks.forEach((publication) => {
    publication.track.enable();
  });
  document.getElementById("localvideo").style.display = "inline-block";
  document.getElementById("localimg").style.display = "none";
}

function handleTrack(track, id) {
  track.on("enabled", () => {
    document.getElementById(id + "_img").style.display = "none";
    document.getElementById(id + "_vid").style.display = "inline-block";
  });
  track.on("disabled", () => {
    document.getElementById(id + "_img").style.display = "inline-block";
    document.getElementById(id + "_vid").style.display = "none";
  });
}
