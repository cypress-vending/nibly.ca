# Standalone-page design QA

final result: passed

Scope: the 16 pages in `standalone-pages.json`, extending the existing five-page
static site. Source: https://www.nibly.ca/, captured September 10, 2026.
Implementation: http://127.0.0.1:4178/ on `codex/standalone-pages`.

## Findings and accepted differences

No remaining actionable P0/P1/P2 findings in the inspected states.

- PayPal, cart and checkout are intentionally absent. The ebook purchase control
  is inactive and explains that online purchasing is unavailable.
- The service form retains the source fields and required fields, but is inactive
  pending the team's HubSpot connection. A visible notice provides email contact.
  Native form submission is also blocked by a page-specific form-action CSP.
- The office map is a local desktop/mobile source capture linked to Google Maps,
  consistent with the original static site's approach; in-page map panning is
  not implemented.
- Two unfinished source pages retain their original “Title” content.
- GitHub Pages normalizes `/store` to `/store/`; the original path remains
  reachable, and production route mappings preserve the requested paths.

## Visual evidence and fidelity

Session evidence is stored locally under `/tmp/nibly-standalone-current/` (not
bundled into the public website). Source screenshots: `screenshots/`; rendered
implementation and paired comparisons: `qa/`; later viewport frames: `qa/frames/`.

Desktop CSS viewport: 1440 × 1000; mobile: 390 × 844. Normal viewport screenshots
are respectively 1440 × 1000 and 390 × 844 pixels (1 pixel per CSS pixel).
Full-page images have variable heights. Comparison sheets are equally scaled
source/local pairs; no device frame or browser chrome is included.

- Full-view evidence: `qa/manuals-desktop-sheet.png`,
  `qa/manuals-mobile-sheet.png`, and per-route `*-pair.png` files.
- Focused evidence: `qa/catalogue-filter-final-pair.png` for the mobile category
  selector/card; `qa/map-final-pair.png` for the final desktop office section;
  request and ebook detail pairs for forms, typography and controls.
- Final map source frames: `qa/map-desktop-viewport.png` and
  `qa/map-mobile-viewport.png`; local: `qa/map-local-desktop-viewport.png`.
- States: settled page content, desktop/mobile layouts, expanded buyer question,
  open/closed mobile menu, selected E-Book category, gallery image 2 of 3,
  and disconnected form with dummy data.

Required fidelity surfaces checked:

- Typography: copied fonts, source display/body hierarchy, sizes, line heights,
  wrapping and content antialiasing. Existing buyer-question styles preserved.
- Spacing: source grid positions and section padding; desktop support-page
  heights match, mobile measurements differ by no more than one pixel in the
  measured support sections. Catalogue mobile columns and category control match.
- Colors: original cream, lavender, blue and lime palette, overlays and text
  colors preserved, including the source's pale logo treatment on cream.
- Images: original local assets, original PDF bytes, three ebook gallery images,
  exact source select chevron and viewport-specific office map captures.
- Content: original standalone text, labels, download names and URL paths;
  only explanatory disconnected/payment notices added for the authorized scope.

## Comparison and repair history

1. P2 typography weight/wrapping drift: matched source content antialiasing and
   wrapping. Rechecked support-page desktop/mobile comparison sheets.
2. P2 mobile catalogue layout: changed one column to the source's two-column
   layout and restored its category dropdown. Rechecked the focused final pair
   and exercised navigation from Store to E-Book.
3. P2 request map framing: replaced the inherited Contact Us map with captures
   of the Request page's desktop/mobile map. Final office-section pair matches.
4. P1 disconnected-form submission bypass: independent review identified that
   native `.submit()` could bypass event cancellation. Added form-action CSP;
   browser network/log inspection confirmed the attempted dummy submission was
   blocked with no outgoing request. Reviewer reverified with no new blocker.

## Behavior and code checks

- `python3 tools/check_site.py --url http://127.0.0.1:4178`: passed for all 21
  pages, unique metadata/H1s, assets/anchors, structured-data graph references,
  FAQ parity, sitemap, canonical routes, aliases, query preservation and 404s.
- Eight local manuals have valid PDF signatures and original filenames.
- All 16 added pages inspected at desktop/mobile: no horizontal overflow or
  broken local images in the checked states.
- Ebook next/previous controls change the image and counter; mobile category
  selection navigates correctly; nested-page Home/CSS links resolve correctly.
- Mobile menu opens and closes with Escape. Existing Before You Buy accordion
  was clicked and its answer appeared.
- Service form Enter and native submit attempts do not navigate or transmit;
  inactive Submit is recognized as disabled. Dummy inputs were cleared.
- `git diff --check`: passed. Existing five HTML pages and base stylesheet are
  unchanged; four existing HubSpot sales forms remain unchanged.

## Remaining proof limits and P3 polish

Source Squarespace animations, lazy images and payment iframes caused some
inconsistent full-page captures. Invalid captures were excluded; valid visible
frames, paired screenshots and source DOM/layout evidence were used instead.
This is a visual/functional review, not a claim of pixel-identical automated
coverage of every source animation. Minor native-select rendering and ebook
card spacing can vary across browsers. No broader cross-browser matrix was run.

## Implementation checklist

- [x] Restore standalone content, original paths and PDFs.
- [x] Match desktop/mobile layouts and repair substantive differences.
- [x] Exercise retained interactions and prevent disconnected form submission.
- [x] Update sitemap, llms.txt and HubSpot connection instructions.
- [x] Pass focused checks and independent review.
- [ ] Team connects and proves service-request delivery through HubSpot.

# Sales representative page extension — September 10, 2026

final result: passed

Six source pages (`/pat`, `/graham`, `/jeff`, `/matt`, `/mackenzie`, `/travis`)
were compared with the plain-HTML copies at http://127.0.0.1:4179/.
Evidence is in `/tmp/nibly-reps-source/`: original HTML, source desktop/mobile
screenshots, corresponding `*-local-*.png` captures, `desktop-comparison.jpg`,
`mobile-comparison.jpg`, and `jeff-final-focused-pair.png`. Raw screenshots use
1440×1000 desktop or 390×844 mobile CSS viewports at 1:1 pixel density; full-page
heights vary. Comparison sheets scale both sides equally. State: initial pages
with video posters, plus separately exercised playback and existing booking links.

All five fidelity surfaces were checked: existing Piepie/Poppins fonts and source
sizes/wrapping; exact source grids, spacing and responsive order; original cream,
blue and gray tokens/hero overlay; source posters/background/video content; and
original rep names, text, Calendly targets and PDF filenames. Existing header and
footer are reused without cart UI. The pages remain outside the main navigation.

Repair history:

- P2 source “black” text token: the older helper mapped this to pure black;
  corrected rep body text to the observed source gray `#86887d`. Final focused
  source/local comparison confirms matching typography, color and wrapping.
- P2 Jeff video letterboxing: removed the initial black background and matched
  the source transparent square frame/top gradient. Final focused comparison
  confirms the frame and content dimensions. Native player controls are an
  intentional simplification and differ from Squarespace's player chrome.
- Video completeness: Matt's first HLS remux collapsed source timestamps;
  remuxed preserving timestamps. Browser duration now reads 385.342 seconds.
  Its original audio track ends at 197.397 seconds; the local copy preserves
  that source limitation. Graham and Jeff use the identical original video.

Verification: all 27 pages pass static and HTTP route checks. All five local demo
pages played and advanced beyond time zero in-browser, with readyState 4, no
media error and no desktop horizontal overflow (`playback-proof.json`). Source
Mackenzie playback also advanced. Desktop/mobile paired visual checks cover all
six pages. Independent review confirmed all rep-specific URLs/PDF bytes, media
provenance, metadata and the single exact Travis YouTube embed exception.

Accepted source limitation: Travis embeds “Dog says hello” and has blank booking
and contact hrefs. The exact video is retained; the two rendered buttons are
disabled, with no invented destination. Those need source content from the team.
The five Calendly destinations are preserved exactly; automated HTTP retrieval
was blocked by Calendly, so appointment availability/delivery is not claimed.
No appointment was booked and no form was submitted during verification.

P3/coverage limits: native media control styling varies by browser. The 360×640
source video rendition matches the normal portrait display size; fullscreen
resolution is lower than the source's optional 1080p stream. Playback smoke
checks and media metadata inspection do not constitute a full narrated review
of every second. No broad cross-browser matrix or third-party booking delivery
verification was performed. No actionable P0/P1/P2 design findings remain.
