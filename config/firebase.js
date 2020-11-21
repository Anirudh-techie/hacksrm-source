var admin = require("firebase-admin");

var serviceAccount = require("../admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rutime-meet.firebaseio.com"
});
