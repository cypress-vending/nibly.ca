# Nibly static website

Twenty-one pages built with plain HTML, CSS and small JavaScript files. The original
Home, The Machine, Locations, Contact Us and Privacy Policy pages are joined by
16 standalone support, service, MADD and ebook pages. `standalone-pages.json`
lists each additional page and its original URL. Images and fonts are local in
`assets/`; eight original PDF manuals retain their exact filenames under `s/`.
There is no build step, shopping cart, checkout, PayPal SDK or Squarespace runtime.

## Preview locally

```sh
python3 tools/preview.py --port 4174
```

Open http://127.0.0.1:4174/. The preview binds only to the local computer, adds
noindex headers and serves a blocking robots.txt. It also exercises the proposed
clean URLs and redirects. You can instead open `index.html` directly: `site.js`
rewrites the page's clean nav links (`/the-machine`, etc.) per host, see
"Hosting status and launch preparation" below, so the same HTML works from disk,
an ordinary static server, GitHub Pages or production.

The enquiry form on Home, Contact Us, Locations and The Machine is now the
same live HubSpot embed (portal `22691627`, form
`584606a2-c862-4806-9216-923f18c529fd`)
([submissions here](https://app.hubspot.com/submissions/22691627/form/584606a2-c862-4806-9216-923f18c529fd/submissions))
and submits real enquiries to HubSpot. The old static form markup and its
browser-native validation are gone from all four pages; `site.js` no longer
does any form handling, only the mobile menu. Privacy Policy has no enquiry
form. Email and telephone links use the published Nibly contact details.

## Editing and checks

Edit the HTML files directly. Shared styling is in `styles.css`; additions are
scoped to `standalone.css`. `site.js` handles the mobile menu and host-aware URLs;
`standalone.js` handles the ebook gallery and the disconnected service form.
Keep `standalone-pages.json`, `routes.txt`, `sitemap.xml` and `llms.txt` synchronized
when adding or removing a page.

### Connecting the service request form

`request.html` contains `#service-request-form` with the original fields, including
required `machine_number` and `request_details`. It is deliberately disconnected.
The Submit control is inactive, Enter is intercepted, and a page-specific
`Content-Security-Policy` (`form-action 'none'`) blocks even native form submits.
No request data is stored or sent. The visible note directs visitors to email.

Replace that form with your dedicated HubSpot form embed, or wire its fields
using the desired HubSpot integration. Then remove the form-action meta policy
if your integration needs native form submission, the disconnected-form code in
`standalone.js`, the inactive button attributes and the connection note. Update
`tools/check_site.py` with the exact intended HubSpot integration and verify a
real submission and delivery before enabling it. Existing sales enquiry embeds
on the four original pages are unchanged.

### Standalone functionality

The MADD page retains its original content and layout but has no PayPal buttons
or scripts. The ebook catalogue links to its detail page and its three-image
gallery works; its purchase button is inactive with an explanation. No online
purchase is available. `/streampay-portal` and `/vendron-setup` intentionally retain
the source site's unfinished “Title” placeholder content.

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
The static site is published at https://cypress-vending.github.io/nibly.ca/ for
team review. The Squarespace site and domain DNS remain unchanged.

The canonical URLs, sitemap and production robots.txt target https://www.nibly.ca/.
They are prepared for an approved future production launch. `routes.txt` is a
host-neutral mapping used by the local preview, not an automatically applied
GitHub Pages or other provider configuration.

Nav links in the HTML source are written as clean, root-relative paths (`/`,
`/the-machine`, etc.) matching the eventual production scheme, and `site.js`
adjusts them per host at load time:

- `nibly.ca` / `www.nibly.ca`: left untouched.
- `cypress-vending.github.io`: prefixed with `/nibly.ca`, the project path
  GitHub Pages serves this repo under. GitHub Pages resolves extension-less
  paths to their `.html` file natively (confirmed: requesting
  `.../nibly.ca/locations` returns `locations.html`'s content directly, no
  redirect), so a prefix is all that's needed, no `routes.txt`-style rewrite
  or `.html` required.
- Everywhere else (local preview, opening a file directly, any other static
  server): rewritten to the real relative `.html` filename, since those
  don't have GitHub Pages' extension resolution.

Update the hostnames in `site.js` if the production domain or the GitHub
Pages project path changes.

Before switching the domain:

- Confirm the hosting/domain decision and configure/test the intended URL mapping.
- Verify all paths in `standalone-pages.json` and the eight `/s/` PDF paths on the chosen host. Do not redirect them all to Home.
- Connect the service request form and decide whether to re-enable donations or ebook sales in a separate change.
- Confirm the company, package, hosting and support copy with the Nibly team.
- All enquiry forms now deliver to HubSpot; confirm form routing/notifications
  are configured in the HubSpot portal and review the inherited privacy policy
  against HubSpot and any other analytics chosen.
- Protect or noindex public staging previews. A canonical tag alone does not
  prevent a preview from being indexed.
- On the production domain, verify crawler access through hosting/CDN controls,
  canonical URLs and sitemap responses, then verify indexing in webmaster tools.

No deployment workflow, custom domain or DNS change is included in this import.

## robots.txt and llms.txt

`robots.txt` permits all crawlers and references the production sitemap. The
wildcard includes search bots; no crawler-specific permissions or new training
restrictions have been introduced. Robots rules are effective only at an origin's
root `/robots.txt`. The file under the GitHub Pages project path is a preview of
the production file, not the robots policy for cypress-vending.github.io. See
[Google's robots.txt location guidance](https://developers.google.com/search/docs/crawling-indexing/robots/create).

`llms.txt` provides a concise public summary and links to all published
pages. Relative links resolve alongside the file on GitHub Pages or the future
production domain. It is an optional content guide, not an access-control file
or a guarantee of search inclusion or citations. It follows the
[llms.txt proposal](https://llmstxt.org/). Keep it synchronized with the visible
pages.

The catalogue uses `store/index.html` so `/store/` works on GitHub Pages alongside
its nested pages. GitHub Pages may normalize `/store` to `/store/`; the original
path remains reachable. Production can serve `/store` directly using `routes.txt`.
