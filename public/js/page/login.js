import * as auth from "../util/auth.js";

export var init = () => {
  document.getElementById("login-form").onsubmit = (e) => {
    e.preventDefault();
    var username = document.getElementById("username").value;
    var pwd = document.getElementById("pwd").value;
    auth.signIn(username, pwd).then(() => {
      location.href = "/";
    });
  };
};
