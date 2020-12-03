import * as school from "./school.js";

export var createschool = () => {
  var create_dialog = new mdc.dialog.MDCDialog(
    document.getElementById("s-create-dlg")
  );
  create_dialog.open();
  document.getElementById("s-create").onsubmit = function (e) {
    e.preventDefault();
    document.getElementById("splash").style.display = "grid";
    var name = document.getElementById("create-name").value;
    var role = "teacher";
    school.createSchool(name, role).then(() => {
      location.href = "/";
    });
  };
};

export var joinschool = () => {
  var join_dlg = new mdc.dialog.MDCDialog(
    document.getElementById("s-join-dlg")
  );
  join_dlg.open();

  document.getElementById("s-join").onsubmit = function (e) {
    e.preventDefault();
    document.getElementById("splash").style.display = "grid";
    var id = document.getElementById("join-id").value;
    var role = "student";
    school.joinSchool(id, role).then(() => {
      location.href = "/";
    });
  };
};
