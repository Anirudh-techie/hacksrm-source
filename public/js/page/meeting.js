import * as auth from "../util/auth.js";
var meeting;
var meetId = "";
var accessToken;

export var init = async () => {
  accessToken = (await (await fetch("/gettoken?id=" + auth.user.uid)).json())
    .id;

  var paths = location.pathname.split("/");
  paths = paths.filter(
    (v) => v != "" && typeof v !== "undefined" && v.trim() != ""
  );
  var id = paths[paths.length - 1];
  var details = await getMeeting(id);
  var page1 = `
  <h1 style='color:#ddd'>${details.name}</h1>
  <h5 style='color:#ddd'>for class ${details.grade}</h5>
  <button id='join-meet'>join</button>
  <div id='localvideo'></div>
  `;

  Twilio.Video.createLocalVideoTrack().then((track) => {
    const localMediaContainer = document.getElementById("localvideo");
    localMediaContainer.appendChild(track.attach());
  });
  document.getElementById("main").innerHTML = page1;
  document.getElementById("join-meet").onclick = joinMeeting;
  meetId = id;
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
  document.getElementById("main").innerHTML = `
   
  <div class="main__left">
        <div class="main__videos">
          <div id="video-grid">
           <div>
              <div id='localvideo'></div>
              <div id='localimg' style='display:none'><img src='${auth.user.photoURL}'/></div>
            </div>

          </div>
          <button id='muteBtn'>Mute Audio</button>
          <button id='videoBtn''>Mute Video</button>
</div></div>`;

  Twilio.Video.connect(accessToken, {
    name: meetId,
    audio: true,
    video: { width: 320, height: 280 },
  }).then(
    (room) => {
      Twilio.Video.createLocalVideoTrack().then((track) => {
        const localMediaContainer = document.getElementById("localvideo");
        localMediaContainer.appendChild(track.attach());
      });
      document.getElementById("muteBtn").onclick = () => {
        console.log("1");
        if (document.getElementById("muteBtn").innerHTML == "Mute Audio") {
          document.getElementById("muteBtn").innerHTML = "Unmute Audio";
          muteAudio(room);
        } else {
          document.getElementById("muteBtn").innerHTML = "Mute Audio";
          unmuteAudio(room);
        }
      };
      document.getElementById("videoBtn").onclick = () => {
        if (document.getElementById("videoBtn").innerHTML == "Mute Video") {
          document.getElementById("videoBtn").innerHTML = "Unmute Video";
          muteVideo(room);
        } else {
          document.getElementById("videoBtn").innerHTML = "Mute Video";
          unmuteVideo(room);
        }
      };
      console.log(`Successfully joined a Room`);
      meeting = room;

      room.participants.forEach((participant) => {
        participant.on("trackSubscribed", (track) => {
          var id = "remote_" + participant.identity;
          var el = document.getElementById(id);
          if (track.kind == "video") {
            handleTrack(track, id);
          }
          if (el) {
            var audio = track.attach();
            document.getElementById(id).append(audio);
          } else {
            var div = document.createElement("div");
            div.classList.add("part-div");
            div.id = id;
            fetch("/getuser?id=" + participant.identity)
              .then((r) => r.json())
              .then((info) => {
                document.getElementById(id + "_name").innerHTML =
                  info.displayName;
                document.getElementById(id + "_img").src = info.photoURL;
                document.getElementById(id + "_img").style.display = "none";
              });

            div.innerHTML += `<h4 class='part-name' id='${id + "_name"}'></h4>`;
            div.innerHTML += `<div class='part-avatar'><img class='avatar' id='${
              id + "_img"
            }'/></div>`;
            var video = track.attach();
            video.id = id + "_vid";
            div.append(video);
            document.getElementById("video-grid").appendChild(div);
          }
        });
      });
      room.on("disconnected", (room) => {
        // Detach the local media elements
        room.localParticipant.tracks.forEach((publication) => {
          const attachedElements = publication.track.detach();
          attachedElements.forEach((element) => element.remove());
        });
      });

      room.on("participantConnected", (participant) => {
        console.log(`Participant "${participant.identity}" connected`);
        participant.on("trackSubscribed", (track) => {
          var id = "remote_" + participant.identity;
          if (track.kind == "video") {
            handleTrack(track, id);
          }
          if (document.getElementById(id)) {
            var audio = track.attach();
            document.getElementById(id).append(audio);
          } else {
            var div = document.createElement("div");
            div.classList.add("part-div");
            div.id = id;
            fetch("/getuser?id=" + participant.identity)
              .then((r) => r.json())
              .then((info) => {
                document.getElementById(id + "_name").innerHTML =
                  info.displayName;
                document.getElementById(id + "_img").src = info.photoURL;
                document.getElementById(id + "_img").style.display = "none";
              });

            div.innerHTML += `<h4 class='part-name' id='${id + "_name"}'></h4>`;
            div.innerHTML += `<div class='part-avatar'><img class='avatar' id='${
              id + "_img"
            }'/></div>`;
            var video = track.attach();
            video.id = id + "_vid";
            div.append(video);
            document.getElementById("video-grid").appendChild(div);
          }
        });
      });
    },
    (error) => {
      console.error(`Unable to connect to Room: ${error.message}`);
    }
  );
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
