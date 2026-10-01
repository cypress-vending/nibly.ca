// HubSpot's updated embed reports success only after the submission is accepted.
// https://developers.hubspot.com/docs/api-reference/latest/marketing/forms/global-form-events
export function connectHubSpotConversions({ windowRef = window, tracking, formId }) {
  const fallbackIds = new Map();
  const onSuccess = event => {
    if (event.detail?.formId !== formId) return;
    try {
      const form = windowRef.HubSpotFormsV4?.getFormFromEvent(event);
      if (!form || form.getFormId() !== formId) return;
      let eventId = form.getConversionId();
      if (typeof eventId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(eventId)) {
        // Older embed versions may not expose a conversion ID. Count at most
        // one success per rendered instance in that case, including callbacks.
        const instanceId = form.getInstanceId();
        if (!instanceId) return;
        if (!fallbackIds.has(instanceId)) fallbackIds.set(instanceId, windowRef.crypto.randomUUID());
        eventId = fallbackIds.get(instanceId);
      }
      tracking.leadConfirmed({ eventId });
    } catch (error) {
      // Measurement must never interrupt HubSpot lead delivery.
      windowRef.console.warn('Nibly conversion tracking could not queue the confirmed lead.');
    }
  };
  windowRef.addEventListener('hs-form-event:on-submission:success', onSuccess);
  return () => windowRef.removeEventListener('hs-form-event:on-submission:success', onSuccess);
}
