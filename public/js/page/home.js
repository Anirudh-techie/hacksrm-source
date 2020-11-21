import * as auth from "../util/auth.js";
import * as school from "../util/school.js";
import * as popup from "../util/popup.js";

export var init = async () => {
  var schools = await school.getSchools();
  document.getElementById("header-img").onclick = function () {
    var e = document.getElementById("options");
    e.hidden = !e.hidden;
  };
  document.addEventListener("click", (e) => {
    var el = document.getElementById("options");
    var img = document.getElementById("header-img");
    if (e.target != el && e.target != img) {
      el.hidden = true;
    }
  });
  document.getElementById("op-name").innerHTML = auth.user.displayName;
  document.getElementById("logout").onclick = function () {
    auth.signOut();
    location.href = "/login";
  };
  document.getElementById("create-btn").onclick = function () {
    popup.createschool();
  };

  document.getElementById("join-btn").onclick = function () {
    popup.joinschool();
  };
  schools.forEach((s) => {
    document.getElementById("school-r").innerHTML +=
      "<div class='s-label'><label>" +
      s.name +
      " <input type='radio' name='school' value='" +
      s.id +
      "'/></label></div>";
  });
  document.getElementById("create-meet").onclick = function () {
    var all = document.getElementsByName("school");
    var val;
    for (var i = 0; i < all.length; i++) {
      if (all[i].checked) {
        val = all[i].value;
      }
    }
    fetch("/newmeeting", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grade: prompt("enter grade: "),
        name: prompt("enter name for new meeting: "),
        schoolid: val,
      }),
    })
      .then((res) => res.json())
      .then((id) => {
        location.href = "/meet/" + id.id;
      });
  };
  document.getElementById("join-meet").onclick = () => {
    var grade = document.getElementById("s-grade").value;
    var all = document.getElementsByName("school");
    var schoolid;
    for (var i = 0; i < all.length; i++) {
      if (all[i].checked) {
        schoolid = all[i].value;
      }
    }
    fetch("/allmeetings", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grade,
        id: schoolid,
      }),
    })
      .then((res) => res.json())
      .then((meetings) => {
        meetings.forEach((m) => {
          document.getElementById(
            "meetings"
          ).innerHTML += `<div class='meet-link'><a href='/meet/${m.id}'>${
            m.name + "  for class " + m.grade
          }</a><div>`;
        });
      });
  };
};
