// The site needs JavaScript only for the mobile menu and adjusting nav
// links outside of production. Nav links in the HTML are clean,
// root-relative paths matching the eventual production scheme (nibly.ca,
// www.nibly.ca), left untouched there. GitHub Pages serves this repo under
// /nibly.ca/ and resolves extension-less paths to their .html file natively
// (confirmed: cypress-vending.github.io/nibly.ca/locations serves
// locations.html directly), so there the links just need the /nibly.ca
// prefix. Everywhere else (local preview, opening a file directly, any
// other static server) has no such resolution, so the real .html filename
// is restored instead.
const CLEAN_URL_FILES = {
  "/": "index.html",
  "/the-machine": "the-machine.html",
  "/locations": "locations.html",
  "/contact-us": "contact-us.html",
  "/privacy-policy": "privacy-policy.html",
};
const PRODUCTION_HOSTS = ["nibly.ca", "www.nibly.ca"];
const GITHUB_PAGES_HOST = "cypress-vending.github.io";
const GITHUB_PAGES_BASE = "/nibly.ca";

function splitHash(href) {
  const hashIndex = href.indexOf("#");
  return hashIndex === -1
    ? [href, ""]
    : [href.slice(0, hashIndex), href.slice(hashIndex)];
}

if (location.hostname === GITHUB_PAGES_HOST) {
  document.querySelectorAll("a[href]").forEach((link) => {
    const [path, hash] = splitHash(link.getAttribute("href"));
    if (path in CLEAN_URL_FILES) {
      link.setAttribute("href", GITHUB_PAGES_BASE + path + hash);
    }
  });
} else if (!PRODUCTION_HOSTS.includes(location.hostname)) {
  document.querySelectorAll("a[href]").forEach((link) => {
    const [path, hash] = splitHash(link.getAttribute("href"));
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
