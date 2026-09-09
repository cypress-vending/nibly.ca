// The site needs JavaScript only for the mobile menu and local form feedback.
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#mobile-nav");
function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  menu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  document.querySelector("main").inert = open;
  document.querySelector("footer").inert = open;
}
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    setMenu(false);
    toggle.focus();
  }
  if (event.key === "Tab" && !menu.hidden) {
    const controls = [
      document.querySelector(".brand"),
      toggle,
      ...menu.querySelectorAll("a"),
    ];
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});
