const firebase = require("firebase-admin");
const WebSocket = require("ws");
// based on examples at https://www.npmjs.com/package/ws
const WebSocketServer = WebSocket.Server;
var server = require("../bin/www").server;
firebase
  .firestore()
  .collection("meetings")
  .get()
  .then((m) => {
    m.docs.forEach((meeting) => {
      var id = meeting.id;
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
    });
  });
