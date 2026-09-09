// The site needs JavaScript only for the mobile menu and, locally, restoring
// .html on nav links since a plain static server won't rewrite clean URLs.
const CLEAN_URL_FILES = {
  "/": "index.html",
  "/the-machine": "the-machine.html",
  "/locations": "locations.html",
  "/contact-us": "contact-us.html",
  "/privacy-policy": "privacy-policy.html",
};
const isLocalPreview =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.port === "4174";
if (isLocalPreview) {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const hashIndex = href.indexOf("#");
    const path = hashIndex === -1 ? href : href.slice(0, hashIndex);
    const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
    const file = CLEAN_URL_FILES[path];
    if (file) link.setAttribute("href", file + hash);
  });
}
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
