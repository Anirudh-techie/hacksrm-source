export function init() {
  document.querySelectorAll("button").forEach((b) => {
    if (b.classList.contains("mdc-button")) {
      return;
    }
    if (!b.classList.contains("no-mdc")) {
      b.classList.add("mdc-button");
      b.classList.add("mdc-button--raised");
      var l = b.innerHTML;
      b.innerHTML = `
        <div class='mdc-button__ripple'></div>
        <span class='mdc-button__label'>${l}</span>
      `;
      new mdc.ripple.MDCRipple(b);
    }
  });
  document.querySelectorAll(".btn").forEach((b) => {
    if (b.classList.contains("mdc-button")) {
      return;
    }
    if (!b.classList.contains("no-mdc")) {
      b.classList.add("mdc-button");
      b.classList.add("mdc-button--raised");
      var l = b.innerHTML;
      b.innerHTML = `
        <div class='mdc-button__ripple'></div>
        <span class='mdc-button__label'>${l}</span>
      `;
      new mdc.ripple.MDCRipple(b);
    }
  });
}
