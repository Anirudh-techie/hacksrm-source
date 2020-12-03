export function init() {
  document.querySelectorAll("button").forEach((b) => {
    if (b.classList.contains("mdc-button")) {
      return;
    }
    if (!b.classList.contains("no-mdc")) {
      b.classList.add("mdc-button");
      b.classList.add("mdc-button--outlined");
      var l = b.innerHTML;
      b.innerHTML = "";
      b.innerHTML += "<div class='mdc-button__ripple'></div>";
      b.innerHTML += `
      <span class='mdc-button__label'>${l}</span>
      `;
      new mdc.ripple.MDCRipple(b);
    }
  });
}
