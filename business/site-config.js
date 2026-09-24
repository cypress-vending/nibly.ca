// Public deployment configuration. NEVER put an API key in this file.
export const siteConfig = Object.freeze({
  previewMode: true,
  adsTrackingEnabled: false,
  openaiPixelId: 'BngSvGS4SNTF4a2utoBtxg',
  allowedOrigins: ['https://nibly.ca'],
  variant: 'baseline',
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
