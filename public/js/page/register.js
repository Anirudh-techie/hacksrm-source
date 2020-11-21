import * as auth from "../util/auth.js";

export var init = () => {
  document.getElementById("register-form").onsubmit = (e) => {
    e.preventDefault();

    var username = document.getElementById("displayName").value;
    var pwd = document.getElementById("pwd").value;
    var email = document.getElementById("email").value;

    auth.signUp(email, pwd, username).then(() => {
      location.href = "/";
    });
  };
};
