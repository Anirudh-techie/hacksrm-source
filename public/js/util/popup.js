import * as school from "./school.js";
import * as button from "./button.js";

export var createschool = () => {
  var div = document.createElement("div");
  div.classList.add("popup");
  div.innerHTML = `
  <button onclick='this.parentNode.remove()'>close</button>
      <form id='create-form'>
         <label>
            Name:
            <input type='text' id='create-name'/>
         </label>
          <label>
            Your Role:
            <select id='create-role'>
            <option value='teacher'>teacher</option>
            <option value='student'>Student</option>
            </select>
         </label>
         <button>Create</button>
      </form>
   `;
  div.getElementsByTagName("form").item(0).onsubmit = function (e) {
    e.preventDefault();
    var name = document.getElementById("create-name").value;
    var role = document.getElementById("create-role").value;
    school.createSchool(name, role).then(() => {
      location.href = "/";
    });
  };
  document.body.append(div);
  button.init();
};

export var joinschool = () => {
  var div = document.createElement("div");
  div.classList.add("popup");
  div.innerHTML = `
  <button onclick='this.parentNode.remove()'>close</button>
      <form id='join-form'>
         <label>
            ID:
            <input type='text' id='join-id'/>
         </label>
          <label>
            Your Role:
            <select id='join-role'>
            <option value='teacher'>teacher</option>
            <option value='student'>Student</option>
            </select>
         </label>
         <button>join</button>
      </form>
   `;
  div.getElementsByTagName("form").item(0).onsubmit = function (e) {
    e.preventDefault();
    var id = document.getElementById("join-id").value;
    var role = document.getElementById("join-role").value;
    school.joinSchool(id, role).then(() => {
      location.href = "/";
    });
  };
  document.body.append(div);
  button.init();
};
