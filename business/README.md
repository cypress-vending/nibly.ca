# Business campaign landing page

`/business/` uses the HubSpot updated form embed (portal `22691627`, form `cfb46a58-42db-4eb5-9d46-53fc060f8252`). It remains noindex for paid traffic. The public site configuration enables the OpenAI pixel only on `https://nibly.ca`; localhost and preview origins cannot send conversions. Never put an API key in these public files.

`baseline.js` initializes tracking and connects the documented `hs-form-event:on-submission:success` event. Only this form's successful submissions emit `lead_created`, using HubSpot's conversion ID for duplicate protection. Failed submissions, clicks and page loads do not emit leads. No contact field values are passed by this adapter. HubSpot owns submission, validation and confirmation independently of pixel availability.

The obsolete native-form `registerProvider` integration is no longer used. Do not restore it for this embed. The account must retain the Nibly info-kit event setting linked to the campaign and this pixel.

Checks: `python3 tools/check_business.py` and `node --test tools/*tracking.test.mjs tools/hubspot-conversions.test.mjs`. Test success, failure, unrelated forms and duplicate callbacks without transmitting synthetic leads to production. Browser queuing does not prove receipt or attribution; verify a genuine successful submission in HubSpot and the OpenAI recent events stream for end-to-end proof.
