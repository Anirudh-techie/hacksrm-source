import * as auth from "../util/auth.js";
var localUuid;
var localDisplayName;
var localStream;
var serverConnection;
var peerConnections = {}; // key is uuid, values are peer connection object and user defined display name string

var peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
var meetId = "";
export var init = async () => {
  var html = `<div class="main__left">
         <div class="main__videos">
            <div id="video-grid">

            </div>
         </div>
         <div class="main__controls">
            <div class="main__controls_block">
               <div class="main__controls__button main__mute_button" onclick="muteUnmute()">
                  <i class='bx bxs-microphone'></i>
                  <span>Mute</span>
               </div>
               <div class="main__controls__button main__video_button" onclick="playStop()">
                  <i class='bx bxs-video'></i>
                  <span>Stop Video</span>
               </div>
            </div>
            <div class="main__controls_block">
               <div class="main__controls__button">
                  <i class='bx bx-check-shield'></i>
                  <span>Security</span>
               </div>
               <div class="main__controls__button">
                  <i class='bx bxs-group'></i>
                  <span>Participants</span>
               </div>
               <div class="main__controls__button">
                  <i class='bx bxs-chat'></i>
                  <span>Chat</span>
               </div>
            </div>
            <div class="main__controls_block">
               <div class="main__controls__button">
                  <span class="leave-meeting">Leave Meeting</span>
               </div>
            </div>
         </div>
      </div>
      <div class="main__right">
         <div class="main__header">
            <h5>Chat</h5>
         </div>
         <div class="main__chat_window">
            <ul class="messages">

            </ul>
         </div>
         <div class="main__message_container">
            <input type="text" id="chat_message" placeholder="Enter Your Message">
         </div>
      </div>`;
  var paths = location.pathname.split("/");
  paths = paths.filter(
    (v) => v != "" && typeof v !== "undefined" && v.trim() != ""
  );
  var id = paths[paths.length - 1];
  var details = await getMeeting(id);
  var page1 = `
  <h1>${details.name}</h1>
  <h5>for class ${details.grade}</h5>
  <button id='join-meet'>join</button>
  `;
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
           <div id="localVideoContainer" class="videoContainer">
              <video id="localVideo" autoplay muted></video>
            </div>
          </div>
</div></div>`;
  localUuid = auth.user.uid;
  localDisplayName = auth.user.displayName;

  var constraints = {
    video: {
      width: { max: 320 },
      height: { max: 280 },
      frameRate: { max: 30 },
    },
    audio: true,
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      localStream = stream;
      document.getElementById("localVideo").srcObject = stream;
    })
    .then(() => {
      serverConnection = new WebSocket(
        "ws://localhost:3000/websocket/" + meetId
      );
      serverConnection.onmessage = gotMessageFromServer;
      serverConnection.onopen = (event) => {
        serverConnection.send(
          JSON.stringify({
            displayName: localDisplayName,
            uuid: localUuid,
            dest: "all",
          })
        );
      };
    });
}

function gotMessageFromServer(message) {
  var signal = JSON.parse(message.data);
  var peerUuid = signal.uuid;

  // Ignore messages that are not for us or from ourselves
  if (
    peerUuid == localUuid ||
    (signal.dest != localUuid && signal.dest != "all")
  )
    return;

  if (signal.displayName && signal.dest == "all") {
    // set up peer connection object for a newcomer peer
    setUpPeer(peerUuid, signal.displayName);
    serverConnection.send(
      JSON.stringify({
        displayName: localDisplayName,
        uuid: localUuid,
        dest: peerUuid,
      })
    );
  } else if (signal.displayName && signal.dest == localUuid) {
    // initiate call if we are the newcomer peer
    setUpPeer(peerUuid, signal.displayName, true);
  } else if (signal.sdp) {
    peerConnections[peerUuid].pc
      .setRemoteDescription(new RTCSessionDescription(signal.sdp))
      .then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == "offer") {
          peerConnections[peerUuid].pc
            .createAnswer()
            .then((description) => createdDescription(description, peerUuid))
            .catch(errorHandler);
        }
      })
      .catch(errorHandler);
  } else if (signal.ice) {
    peerConnections[peerUuid].pc
      .addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch(errorHandler);
  }
}

function setUpPeer(peerUuid, displayName, initCall = false) {
  peerConnections[peerUuid] = {
    displayName: displayName,
    pc: new RTCPeerConnection(peerConnectionConfig),
  };
  peerConnections[peerUuid].pc.onicecandidate = (event) =>
    gotIceCandidate(event, peerUuid);
  peerConnections[peerUuid].pc.ontrack = (event) =>
    gotRemoteStream(event, peerUuid);
  peerConnections[peerUuid].pc.oniceconnectionstatechange = (event) =>
    checkPeerDisconnect(event, peerUuid);
  peerConnections[peerUuid].pc.addStream(localStream);

  if (initCall) {
    peerConnections[peerUuid].pc
      .createOffer()
      .then((description) => createdDescription(description, peerUuid))
      .catch(errorHandler);
  }
}

function gotIceCandidate(event, peerUuid) {
  if (event.candidate != null) {
    serverConnection.send(
      JSON.stringify({ ice: event.candidate, uuid: localUuid, dest: peerUuid })
    );
  }
}

function createdDescription(description, peerUuid) {
  console.log(`got description, peer ${peerUuid}`);
  peerConnections[peerUuid].pc
    .setLocalDescription(description)
    .then(function () {
      serverConnection.send(
        JSON.stringify({
          sdp: peerConnections[peerUuid].pc.localDescription,
          uuid: localUuid,
          dest: peerUuid,
        })
      );
    })
    .catch(errorHandler);
}

function gotRemoteStream(event, peerUuid) {
  console.log(event);
  if (event.track.kind == "video") {
    //assign stream to new HTML video element
    var vidElement = document.createElement("video");
    vidElement.setAttribute("autoplay", "");
    vidElement.setAttribute("muted", "");
    vidElement.srcObject = event.streams[0];
    var vidContainer = document.createElement("div");
    vidContainer.setAttribute("id", "remoteVideo_" + peerUuid);
    vidContainer.setAttribute("class", "videoContainer");
    vidContainer.appendChild(vidElement);
    vidContainer.appendChild(makeLabel(peerConnections[peerUuid].displayName));

    document.getElementById("video-grid").appendChild(vidContainer);
  } else if (event.track.kind == "audio") {
    //do nothing
  }
  updateLayout();
}

function checkPeerDisconnect(event, peerUuid) {
  var state = peerConnections[peerUuid].pc.iceConnectionState;
  console.log(`connection with peer ${peerUuid} ${state}`);
  if (state === "failed" || state === "closed" || state === "disconnected") {
    delete peerConnections[peerUuid];
    document.getElementById("remoteVideo_" + peerUuid).remove();
    updateLayout();
  }
}

function updateLayout() {
  // update CSS grid based on number of diplayed videos
  var rowHeight = "98vh";
  var colWidth = "98vw";

  var numVideos = Object.keys(peerConnections).length + 1; // add one to include local video

  if (numVideos > 1 && numVideos <= 4) {
    // 2x2 grid
    rowHeight = "48vh";
    colWidth = "48vw";
  } else if (numVideos > 4) {
    // 3x3 grid
    rowHeight = "32vh";
    colWidth = "32vw";
  }

  document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
  document.documentElement.style.setProperty(`--colWidth`, colWidth);
}

function makeLabel(label) {
  var vidLabel = document.createElement("div");
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute("class", "videoLabel");
  return vidLabel;
}

function errorHandler(error) {
  console.log(error);
}
