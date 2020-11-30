import * as auth from "../util/auth.js";
import * as school from "../util/school.js";
import * as popup from "../util/popup.js";
import * as button from "../util/button.js";
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
    document.getElementById("school-r").innerHTML += `
      <div class='s-label' value='${s.id}'>
        ${s.name}
        <i class="material-icons s-icon">check</i>
      </div>`;
  });
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
        var btn = document.createElement("button");
        btn.id = "create-meet";
        btn.innerHTML = "Create A Session";
        document.getElementById("searchmeet").append(btn);
        document.getElementById("create-meet").onclick = createMeet;
      }
      showMeetings(s[0]);
      button.init();
    };
  }
  document.getElementsByClassName("s-label")[0].click();
  function showMeetings(data) {
    document.getElementById("mymeet-div").innerHTML = `
      ${data.classes
        .map(
          (d) => `
        <div>
          <h1>${d.name}</h1>
          ${d.meetings
            .map(
              (m) => `
            <a href='/meet/${m.id}'>${m.name}</a>
          `
            )
            .join("")}
        </div>
        `
        )
        .join("")}
    `;
  }
  button.init();
  document.getElementById("join-meet").onclick = () => {
    var grade = document.getElementById("s-grade").value;
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
function createMeet() {
  var all = document.getElementsByName("s-label");
  var val;
  for (var i = 0; i < all.length; i++) {
    if (all[i].hasAttribute("selected")) {
      val = all[i].getAttribute("value");
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
}
