import { getSchools } from "../util/school.js";
import * as button from "../util/button.js";
export var init = async () => {
  var schools = await getSchools();
  if (schools.length <= 0) {
    location.href = "/pages/joinschool.html";
  }
  button.init();
};
