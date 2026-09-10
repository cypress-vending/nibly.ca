// The request form has no backend yet. Cancel normal submits; request.html
// also uses form-action CSP to block native/programmatic submission.
const requestForm = document.querySelector('#service-request-form');
if (requestForm) {
  requestForm.addEventListener('submit', event => event.preventDefault());
  requestForm.querySelector('#request-submit').addEventListener('click', () => {
    const note = requestForm.querySelector('#request-connection-note');
    note.setAttribute('tabindex', '-1');
    note.focus();
  });
}
const gallery = document.querySelector('.ebook-gallery');
if (gallery) {
  const thumbnails = [...gallery.querySelectorAll('[data-image-index]')];
  const image = gallery.querySelector('#ebook-gallery-image');
  let current = 0;
  function show(index) {
    current = (index + thumbnails.length) % thumbnails.length;
    image.src = thumbnails[current].querySelector('img').src;
    image.alt = ['Starting & Funding a Business in Canada cover',
      'Starting & Funding a Business in Canada on a tablet',
      'Starting & Funding a Business in Canada ebook preview'][current];
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    gallery.querySelector('.gallery-counter').textContent = `${current + 1} / ${thumbnails.length}`;
  }
  thumbnails.forEach((button, i) => button.addEventListener('click', () => show(i)));
  gallery.querySelector('.gallery-previous').addEventListener('click', () => show(current - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => show(current + 1));
}
const category = document.querySelector('#catalogue-category');
if (category) {
  const categoryLinks = new Map([...document.querySelectorAll('[data-category-target]')]
    .map(link => [link.dataset.categoryTarget, link]));
  category.addEventListener('change', () => {
    const link = categoryLinks.get(category.value);
    if (link) location.assign(link.href);
  });
}
