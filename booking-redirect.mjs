// After a successful sales enquiry, leave HubSpot's confirmation visible for a
// second, then send the visitor to the Calendly round robin to book a call.
export const bookingUrl = 'https://calendly.com/d/cv5w-hbr-rdr/nibly-meeting';

export const bookingFormIds = Object.freeze([
  '584606a2-c862-4806-9216-923f18c529fd', // Home, The Machine, Locations, Contact Us
  '915079cb-bc34-4b07-9079-26e9c3e19248', // /business, /side-hustle, /franchise
]);

export function connectBookingRedirect({ windowRef = window, formIds = bookingFormIds } = {}) {
  let scheduled = false;
  windowRef.addEventListener('hs-form-event:on-submission:success', event => {
    if (!formIds.includes(event.detail?.formId) || scheduled) return;
    scheduled = true;
    // Let HubSpot render and paint its confirmation before starting the delay.
    windowRef.requestAnimationFrame(() => {
      windowRef.requestAnimationFrame(() => {
        windowRef.setTimeout(() => windowRef.location.assign(bookingUrl), 1000);
      });
    });
  });
}

// Pages load this file as a module; Node tests import it without a window.
if (typeof window !== 'undefined') connectBookingRedirect();
