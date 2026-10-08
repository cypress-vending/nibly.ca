(() => {
  const status = document.querySelector('#madd-payment-status');
  const showError = () => {
    status.textContent = 'PayPal is unavailable right now. Please reload the page or contact twright@cypressvending.ca for help.';
  };
  if (!window.paypal) {
    showError();
    return;
  }
  paypal.Buttons({
    style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
    createSubscription(data, actions) {
      return actions.subscription.create({ plan_id: 'P-50R5927021406603JNELCSRY', quantity: 1 });
    },
    onApprove(data) {
      status.textContent = `Thank you! Your PayPal subscription ID is ${data.subscriptionID}. Check your email and confirm your subscription with twright@cypressvending.ca.`;
    },
    onCancel() {
      status.textContent = 'Subscription cancelled. You can try again when you are ready.';
    },
    onError: showError
  }).render('#paypal-button-container-P-50R5927021406603JNELCSRY').catch(showError);
})();
