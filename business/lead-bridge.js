import { createNiblyTracking } from './tracking/nibly-tracking.mjs';
import { siteConfig } from './site-config.js';
const tracking = createNiblyTracking({
 enabled: !siteConfig.previewMode && siteConfig.adsTrackingEnabled,
 pixelId: siteConfig.openaiPixelId,
 allowedOrigins: siteConfig.allowedOrigins,
});
const pendingIds = new Set();
// The HubSpot implementer calls these from trusted integration code, not postMessage payloads.
export const leadBridge = Object.freeze({
 setMeasurementConsent: (granted) => tracking.setConsent(granted === true),
 prepareSubmission() {
  const eventId = crypto.randomUUID();
  pendingIds.add(eventId);
  return { eventId, hiddenFields: {
   ...tracking.getAttribution(),
   landing_page_variant: siteConfig.variant,
   openai_event_id: eventId,
  }};
 },
 confirmHubSpotSuccess({ eventId } = {}) {
  if (siteConfig.previewMode) return {queued:false,reason:'preview-mode'};
  if (!pendingIds.has(eventId)) return {queued:false,reason:'unknown-submission'};
  pendingIds.delete(eventId);
  return tracking.leadConfirmed({eventId});
 },
});
window.NiblyLeadBridge = leadBridge;
