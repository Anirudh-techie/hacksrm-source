import * as auth from "../util/auth.js";
import * as school from "../util/school.js";
import * as popup from "../util/popup.js";
import * as button from "../util/button.js";
import { forEach } from "../util/forEach.js";
export var init = async () => {
  var schools = await school.getSchools();
  if (school.length <= 0) {
    location.href = "/pages/joinschool.html";
  }
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
  document.querySelectorAll(".mdc-text-field").forEach((e) => {
    new mdc.textField.MDCTextField(e);
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

  var menu = new mdc.menu.MDCMenu(document.querySelector(".mdc-menu"));

  schools.forEach((s) => {
    document.getElementById("school-r").innerHTML += `
      <div class='s-label' value='${s.id}'>
        ${s.name}
        <i class="material-icons s-icon">check</i>
      </div>`;
  });
  document.getElementById("join-class").onclick = function () {
    menu.open = true;
  };
  var items = document.getElementsByClassName("s-label");
  for (let j = 0; items.length > j; j++) {
    var i = items.item(j);
    i.onclick = (e) => {
      console.log("hi");
      for (let k = 0; items.length > k; k++) {
        var a = items.item(k);
        a.removeAttribute("selected");
        a.getElementsByClassName("s-icon")[0].style.display = "none";
      }
      e.target.toggleAttribute("selected", true);
      e.target.getElementsByClassName("s-icon")[0].style.display =
        "inline-block";
      var v = e.target.getAttribute("value");
      var s = schools.filter((d) => {
        return d.id == v;
      });
      var b = document.getElementById("create-meet");
      if (b) b.remove();
      if (s[0].role == "teacher") {
        document.getElementById("menu-list").innerHTML += `
        <li class="mdc-list-item" role="menuitem" id="create-meet">
            <span class="mdc-list-item__ripple"></span>
            <span class="mdc-list-item__text">Create A Session</span>
        </li>`;
        document.getElementById("create-meet").onclick = createMeet;
        document.getElementById("m-create-class").onclick = createClass;
      }
      document.getElementById("s-grade").innerHTML = `
        ${forEach(
          s[0].allclasses,
          (q) => `
          <option value='${q.id}'>${q.name}</option>
          `
        )}
      `;
      showMeetings(s[0]);
      button.init();
    };
  }
  try {
    document.getElementsByClassName("s-label")[0].click();
  } catch {}

  function showMeetings(data) {
    document.getElementById("mymeet-div").innerHTML = `
      ${forEach(
        data.classes,
        (d) => `
        <div class='class-list'>
          <h3 class='class-toggle'>
            ${d.name}
            <i class='class-icon material-icons'>keyboard_arrow_down</i>
          </h3>
          <div class='class-sub' hidden>
            ${forEach(
              d.meetings,
              (m) => `
              <a class='class-link' href='/meet/${m.id}'>${m.name}</a><br>
            `
            )}
          </div>
        </div>
        `
      )}
    `;
    document.querySelectorAll(".class-toggle").forEach((e) => {
      e.onclick = function () {
        var el = this.parentElement.getElementsByClassName("class-sub")[0];
        el.hidden = !el.hidden;
      };
    });
  }
  button.init();
  document.getElementById("join-meet").onclick = () => {
    var _class_ = document.getElementById("s-grade").value;
    var all = document.getElementsByClassName("s-label");
    var schoolid;
    for (var i = 0; i < all.length; i++) {
      if (all[i].hasAttribute("selected")) {
        schoolid = all[i].getAttribute("value");
      }
    }

    fetch("/allmeetings", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        class: _class_,
      }),
    })
      .then((res) => res.json())
      .then((meetings) => {
        document.getElementById("meetings").innerHTML = forEach(
          meetings,
          (m) =>
            `<div class='meet-link'><a href='/meet/${m.id}'>${m.name}</a><div>`
        );
      });
  };
};
function createClass() {
  console.log("hello hi");
  var all = document.getElementsByClassName("s-label");
  var schoolid;
  for (var i = 0; i < all.length; i++) {
    if (all[i].hasAttribute("selected")) {
      schoolid = all[i].getAttribute("value");
    }
  }
  var userid = auth.user.uid;
  var name = prompt("Name of class: ");
  fetch("/newclass", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      schoolid,
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      fetch("/joinclass", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classid: r.id,
          userid,
          schoolid,
        }),
      });
    });
}
function createMeet() {
  if (document.getElementById("s-grade").length <= 0) {
    alert("create a class first");
    return;
  }
  var create_dialog = new mdc.dialog.MDCDialog(
    document.getElementById("m-create-dlg")
  );
  create_dialog.open();
  document.getElementById("m-class").innerHTML = document.getElementById(
    "s-grade"
  ).innerHTML;
  document.getElementById("m-create").onsubmit = function (e) {
    e.preventDefault();
    var _class_ = document.getElementById("m-class").value;
    var all = document.getElementsByClassName("s-label");
    var schoolid;
    for (var i = 0; i < all.length; i++) {
      if (all[i].hasAttribute("selected")) {
        schoolid = all[i].getAttribute("value");
      }
    }
    var name = document.getElementById("m-name").value;
    fetch("/newmeeting", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        class: _class_,
        name,
        schoolid,
      }),
    })
      .then((res) => res.json())
      .then((id) => {
        location.href = "/meet/" + id.id;
      });
  };
}
