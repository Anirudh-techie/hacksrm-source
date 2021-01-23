import * as auth from "./auth.js";
export var getSchools = async () => {
  return await (
    await fetch("/getschools", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: auth.user.uid,
      }),
    })
  ).json();
 
};

export var joinSchool = async (id, role) => {
  console.log(id);
  return await (
    await fetch("/joinschool", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: auth.user.uid,
        schoolid: id,
        role,
      }),
    })
  ).json();
};

export var createSchool = async (name, role) => {
  var id = await (
    await fetch("/newschool", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      }),
    })
  ).json();
  id = id.id;
  alert("Your school id: " + id);
  return await joinSchool(id, role);
};
