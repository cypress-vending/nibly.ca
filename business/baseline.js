import { siteConfig } from './site-config.js';
import { createNiblyTracking } from './tracking/nibly-tracking.mjs';
import { connectHubSpotConversions } from './tracking/hubspot-conversions.mjs';

const tracking = createNiblyTracking({
  enabled: !siteConfig.previewMode && siteConfig.adsTrackingEnabled,
  pixelId: siteConfig.openaiPixelId,
  allowedOrigins: siteConfig.allowedOrigins,
});
connectHubSpotConversions({ tracking, formId: siteConfig.hubspotFormId });
