# Business landing-page baseline

Source-faithful page at `/business/`. It is intentionally noindex and inactive while HubSpot is connected. It does not load legacy Unbounce/advertising scripts or send preview submissions.

The public files are plain HTML/CSS/JavaScript with locally hosted images and fonts. No build step is needed.

To enable leads, implement an approved HubSpot provider and register it using `window.NiblyFormIntegration.registerProvider(async ({fields,hiddenFields,eventId}) => ...)`. Return `{accepted:true}` only after provider acknowledgement. Wire the actual consent manager to `.setMeasurementConsent(boolean)`. Then update `site-config.js`: previewMode false, public Pixel ID, exact HTTPS origin, and adsTrackingEnabled true when measurement is ready. Never put secret API keys in website files.

The provider registration enables the submit button only outside preview mode. Remove the preview notice/footer and preview title after integration passes end-to-end testing. Current field names are email, phone, firstname, lastname and Investment Requirement. The acknowledgement is optional, matching the source. Hidden attribution and event-ID values are supplied to the provider interface.

OpenAI conversion reporting requires a web pixel and standard lead_created setting in the advertiser account; no IDs are configured in this release. Successful browser queuing does not prove event receipt. Verify a consented provider submission reaches HubSpot and Ads Manager before directing paid traffic here.
