const bookingUrl = 'https://calendly.com/d/cv5w-hbr-rdr/nibly-meeting';

export function connectBusinessRedirect({ windowRef = window, formId }) {
  if (!/^\/business\/?$/.test(windowRef.location.pathname)) return;
  let scheduled = false;
  windowRef.addEventListener('hs-form-event:on-submission:success', event => {
    if (event.detail?.formId !== formId || scheduled) return;
    scheduled = true;
    // Let HubSpot render and paint its confirmation before starting the delay.
    windowRef.requestAnimationFrame(() => {
      windowRef.requestAnimationFrame(() => {
        windowRef.setTimeout(() => windowRef.location.assign(bookingUrl), 1000);
      });
    });
  });
}
