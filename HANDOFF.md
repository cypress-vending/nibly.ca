# Handoff

## What this is

Static marketing site for Nibly (AI vending machines, Cypress Vending Corp.), served from `main` via GitHub Pages at https://nibly.ca. Plain HTML, CSS and small JS files, no build step. `README.md` is the detailed reference; read the relevant section there before changing a feature.

## Structure

- Root `*.html`: core pages (Home, The Machine, Locations, Contact Us, Privacy Policy), standalone support/guide pages, sales rep pages (`pat.html`, `graham.html`, etc.) and `meet.html` (redirect to the booking page, passes query strings through).
- `styles.css` shared styles, `standalone.css` / `rep-pages.css` scoped additions, `site.js` mobile menu and host-aware links, `standalone.js` disconnected service form, `booking-redirect.mjs` sends sales form submissions to Calendly.
- `business/`, `side-hustle/`, `franchise/`: noindex paid campaign landing pages with HubSpot forms and tracking (see `business/README.md`).
- `assets/` images and fonts, `s/` original PDFs (exact filenames matter).
- `standalone-pages.json`, `routes.txt`, `sitemap.xml`, `llms.txt`: keep in sync when adding or removing a page.
- `tools/`: `check_site.py` (main checker, must pass), `check_business.py`, `check_resource_pdfs.py`, `preview.py` (local preview), Node tests (`node --test tools/*.test.mjs`).

## Conventions

- Every public page carries the Meta pixel (`1051763753797502`) and the shared JSON-LD graph; `check_site.py` enforces both, with explicit exceptions listed in the script.
- New HTML files must be registered in `standalone-pages.json` or the exception sets in `tools/check_site.py`, otherwise the page inventory check fails.
- Work goes through PRs to `main`; never commit or push unless the user says so.

## Where things stand

- Latest work: every sales form (Home, The Machine, Locations, Contact Us, /business, /side-hustle, /franchise) redirects to the Calendly round robin after submit via root `booking-redirect.mjs` (branch `calendly-redirect-all-forms`).
- Before that: `/meet` booking redirect.
- Known issue on main: `people-find-locations-for-their-vending-machines.html` is not registered in `standalone-pages.json`/`routes.txt`, so `tools/check_site.py` fails its page inventory check.
- Earlier: testimonials page, Meta pixel everywhere, business form redirect to Calendly, ops manual restored, approved copy on Home/The Machine/Locations.
- Open items from README: service request form still disconnected, Travis rep page unfinished, production launch checklist in README "Hosting status".
