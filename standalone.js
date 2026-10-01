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
