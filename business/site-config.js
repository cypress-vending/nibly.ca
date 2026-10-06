// Public deployment configuration. NEVER put an API key in this file.
export const siteConfig = Object.freeze({
  previewMode: false,
  adsTrackingEnabled: true,
  openaiPixelId: 'BngSvGS4SNTF4a2utoBtxg',
  allowedOrigins: ['https://nibly.ca'],
  variant: 'baseline',
  hubspotFormId: '915079cb-bc34-4b07-9079-26e9c3e19248',
});

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  const hash = anchor.getAttribute('href');
  if (hash.length <= 1) return;
  const target = document.querySelector(hash);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
});
