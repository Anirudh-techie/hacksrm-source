import * as auth from "./auth.js";
import * as login from "../page/login.js";
import * as register from "../page/register.js";
import * as home from "../page/home.js";
import * as meet from "../page/meeting.js";
import * as account from "../page/account.js";
window.init = async (page) => {
  var firebaseConfig = {
    apiKey: " AIzaSyB_UcmOhNnPUUO00C4WDcIH12KaSdZiGD4",
    authDomain: "rutime-meet.firebaseapp.com",
    databaseURL: "https://rutime-meet.firebaseio.com/",
    projectId: "rutime-meet",
    storageBucket: "rutime-meet.appspot.com",
    messagingSenderId: "91012351292",
    appId: "1:91012351292:web:0852cf72d77864b15aca39",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  await auth.init();
  if (auth.signed_in && page == "home") {
    document.getElementById("header-img").src =
      auth.user.photoURL || "https://i.stack.imgur.com/IHLNO.jpg";
  }
  if (page == "home") {
    if (!auth.signed_in) {
      location.href = "/login";
    }
    await home.init();
  }
  if (page == "account") {
    if (!auth.signed_in) {
      location.href = "/login";
    }
    await account.init();
  }
  if (page == "meet") {
    if (!auth.signed_in) {
      location.href = "/login";
    }
    meet.init();
  }
  if (page == "login") {
    if (auth.signed_in) {
      location.href = "/";
    }
    console.log(auth);
    login.init();
  }
  if (page == "register") {
    if (auth.signed_in) {
      location.href = "/";
    }
    register.init();
  }

  document.getElementById("splash").style.display = "none";
};
