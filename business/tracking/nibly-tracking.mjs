// Browser-only adapter. Public pixel ID only; never insert an Ads API key here.
// Inert until enabled on an allowlisted HTTPS origin. Uses the SDK consent default.
export function createNiblyTracking({ enabled = false, pixelId = '', allowedOrigins = [], windowRef = globalThis.window } = {}) {
  const w = windowRef;
  const location = w?.location;
  const eligible = enabled === true && Boolean(pixelId) && !pixelId.includes('YOUR') && location?.protocol === 'https:' && allowedOrigins.includes(location.origin) && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  let consent = eligible;
  let initialized = false;
  const sent = new Set();
  const fields = ['oppref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const attributionKey = 'nibly_ads_attribution';
  const sentKey = 'nibly_ads_sent_ids';
  function read(key, fallback) {
    try { return JSON.parse(w.sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function write(key, value) {
    try { w.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be unavailable. */ }
  }
  function attribution() {
    if (!eligible || !consent) return {};
    const previous = read(attributionKey, {});
    const params = new URLSearchParams(location.search);
    const result = {};
    for (const key of fields) {
      const value = params.get(key) || previous?.[key];
      if (typeof value === 'string' && value.length <= 2048) result[key] = value;
    }
    write(attributionKey, result);
    return result;
  }
  function initialize() {
    if (initialized) return;
    if (!w.oaiq) {
      const queue = function () { queue.q.push(arguments); };
      queue.q = [];
      w.oaiq = queue;
      const script = w.document.createElement('script');
      script.async = true;
      script.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
      w.document.head.appendChild(script);
    }
    w.oaiq('init', { pixelId });
    initialized = true;
  }
  if (eligible) { initialize(); attribution(); }
  return {
    // Optional integration for an existing consent manager; not required to initialize.
    setConsent(granted) {
      consent = eligible && granted === true;
      if (consent) {
        initialize();
        w.oaiq('consent', true);
        attribution();
      } else {
        if (initialized) w.oaiq('consent', false);
        try { w?.sessionStorage.removeItem(attributionKey); w?.sessionStorage.removeItem(sentKey); } catch {}
      }
      return consent;
    },
    getAttribution: attribution,
    // Call only after a successful provider acknowledgement, never on submit/click.
    // Pass a stable non-PII submission UUID, shared with server events if added later.
    leadConfirmed({ eventId } = {}) {
      if (!eligible || !consent || !initialized) return { queued: false, reason: 'disabled-or-no-consent' };
      if (typeof eventId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(eventId)) return { queued: false, reason: 'invalid-event-id' };
      const stored = read(sentKey, []);
      const previous = Array.isArray(stored) ? stored : [];
      if (sent.has(eventId) || previous.includes(eventId)) return { queued: false, reason: 'duplicate' };
      w.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: eventId });
      sent.add(eventId);
      write(sentKey, [...previous.slice(-199), eventId]);
      return { queued: true, eventId }; // Queued is not proof of delivery or attribution.
    },
  };
}
