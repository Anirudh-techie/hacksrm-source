export var signed_in = false;
export var user = undefined;
export var init = () => {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged((userdata) => {
      if (userdata) {
        signed_in = true;
        user = userdata;
      } else {
        signed_in = false;
      }
      resolve();
    });
  });
};

export var signUp = async (email, pwd, name) => {
  console.log(email, pwd, name);
  var result = await firebase.auth().createUserWithEmailAndPassword(email, pwd);
  var user = result.user;
  await user.updateProfile({
    displayName: name,
    photoURL: "https://i.stack.imgur.com/IHLNO.jpg",
  });
  await fetch("/adduser", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userid: user.uid,
      name: user.displayName,
    }),
  });
  return user;
};

export var signOut = () => {
  firebase.auth().signOut();
};

export var signIn = async (email, pwd) => {
  console.log(email, pwd);
  return await firebase.auth().signInWithEmailAndPassword(email, pwd);
};
