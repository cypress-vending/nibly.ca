import { leadBridge } from './lead-bridge.js';
import { siteConfig } from './site-config.js';

const form = document.querySelector('[data-lead-form]');
const result = document.getElementById('form-188-form-success-message');
const button = form.querySelector('button');
let provider;
let pending = false;
result.textContent = '';
button.disabled = true; // Remains disabled until the production HubSpot provider is registered.

function showResult(message) {
 result.textContent = message;
 result.hidden = false;
 result.classList.add('preview-result');
 result.scrollIntoView({block:'center',behavior:'smooth'});
}

// Nibly's HubSpot implementer registers a trusted submission function here.
// It must resolve {accepted:true} only after the actual provider acknowledges success.
window.NiblyFormIntegration = Object.freeze({
 ...leadBridge,
 registerProvider(submitToHubSpot) {
  if (typeof submitToHubSpot !== 'function') throw new TypeError('Expected a HubSpot submission function');
  provider = submitToHubSpot;
  if (!siteConfig.previewMode) button.disabled = false;
 },
});

form.addEventListener('submit', async (event) => {
 event.preventDefault();
 if (pending) return;
 if (siteConfig.previewMode) {
  showResult('Preview only — your form passed validation. No information was sent or saved. The Nibly team will connect this form to HubSpot before launch.');
  return;
 }
 if (!provider) { showResult('This form is not available yet. Please try again later.'); return; }
 pending = true; button.disabled = true;
 const { eventId, hiddenFields } = leadBridge.prepareSubmission();
 try {
  const response = await provider({fields:Object.fromEntries(new FormData(form)),hiddenFields,eventId});
  if (response?.accepted !== true) throw new Error('Submission not acknowledged');
  showResult('Thank you! Your request has been received.');
  // Lead delivery succeeds independently of browser tracking availability.
  try { leadBridge.confirmHubSpotSuccess({eventId}); } catch { /* Measurement must never break lead delivery. */ }
  form.reset();
 } catch {
  showResult('We couldn’t confirm your request. Your details are still here so you can try again.');
 } finally { pending = false; button.disabled = false; }
});
document.querySelectorAll('a[href="#form-188-form"]').forEach(a=>a.addEventListener('click',e=>{
 e.preventDefault();form.scrollIntoView({block:'start',behavior:'smooth'});
}));
