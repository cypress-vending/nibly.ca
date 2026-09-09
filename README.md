# Nibly static website

Five public pages built with plain HTML, CSS and a small JavaScript file:
Home, The Machine, Locations, Contact Us and Privacy Policy. Original images and
fonts are stored locally in `assets/`. No package installation or build step is
required. There is no shopping cart, checkout, database or Squarespace runtime.

## Preview locally

```sh
python3 tools/preview.py --port 4174
```

Open http://127.0.0.1:4174/. The preview binds only to the local computer, adds
noindex headers and serves a blocking robots.txt. It also exercises the proposed
clean URLs and redirects. You can instead open `index.html` directly: relative
HTML links and assets work from disk or an ordinary static server.

Forms currently provide local validation and an explicit no-send message. They
do not submit or store enquiries. Email and telephone links use the published
Nibly contact details.

## Editing and checks

Edit the five HTML files directly. Shared styling is in `styles.css`; `site.js`
handles the mobile menu and local form feedback. The inherited `scripts.js` is
unused by the new pages. The existing favicon is retained.

Metadata and JSON-LD are inline in the HTML. Keep structured data consistent with
visible content, particularly the questions and answers on The Machine page.
There are no product offers, prices or review ratings in the schema.

```sh
python3 tools/check_site.py
# With the local preview running:
python3 tools/check_site.py --url http://127.0.0.1:4174
```

## Hosting status and launch preparation

This repository currently publishes its `main` branch through GitHub Pages.
The static-site import is supplied on a separate branch for review. Uploading
that branch does not replace the current published page or the Squarespace site.

The canonical URLs, sitemap and production robots.txt target https://www.nibly.ca/.
They are prepared for an approved future production launch. `routes.txt` is a
host-neutral mapping used by the local preview, not an automatically applied
GitHub Pages or other provider configuration. GitHub Pages will serve the relative
`.html` links, but does not apply this manifest's redirects and clean-URL rewrites.

Before merging for publication or switching the domain:

- Confirm the hosting/domain decision and configure/test the intended URL mapping.
- Decide how to retain, move or retire the existing store, charity and operator
  support URLs, which are outside this five-page site. Do not redirect them all
  to Home.
- Confirm the company, package, hosting and support copy with the Nibly team.
- Connect and test enquiry delivery; review the inherited privacy policy against
  the actual hosting, form service and any analytics chosen.
- Protect or noindex public staging previews. A canonical tag alone does not
  prevent a preview from being indexed.
- On the production domain, verify crawler access through hosting/CDN controls,
  canonical URLs and sitemap responses, then verify indexing in webmaster tools.

No deployment workflow, custom domain or DNS change is included in this import.
