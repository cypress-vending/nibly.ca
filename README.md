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

The enquiry form on Home, Contact Us, Locations and The Machine is now the
same live HubSpot embed (portal `22691627`, form
`584606a2-c862-4806-9216-923f18c529fd`)
([submissions here](https://app.hubspot.com/submissions/22691627/form/584606a2-c862-4806-9216-923f18c529fd/submissions))
and submits real enquiries to HubSpot. The old static form markup and its
browser-native validation are gone from all four pages; `site.js` no longer
does any form handling, only the mobile menu. Privacy Policy has no enquiry
form. Email and telephone links use the published Nibly contact details.

## Editing and checks

Edit the five HTML files directly. Shared styling is in `styles.css`; `site.js`
now only handles the mobile menu. Its local form-feedback code was removed
when the enquiry forms were replaced with the HubSpot embed. The inherited
`scripts.js` is unused by the new pages. The existing favicon is retained.

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
GitHub Pages or other provider configuration. GitHub Pages will serve the relative
`.html` links, but does not apply this manifest's redirects and clean-URL rewrites.

Before switching the domain:

- Confirm the hosting/domain decision and configure/test the intended URL mapping.
- Decide how to retain, move or retire the existing store, charity and operator
  support URLs, which are outside this five-page site. Do not redirect them all
  to Home.
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

`llms.txt` provides a concise public summary and links to the five published
pages. Relative links resolve alongside the file on GitHub Pages or the future
production domain. It is an optional content guide, not an access-control file
or a guarantee of search inclusion or citations. It follows the
[llms.txt proposal](https://llmstxt.org/). Keep it synchronized with the visible
pages. Its preview-form note still describes the old no-send behavior and needs
updating now that the Home page enquiry form delivers to HubSpot.
