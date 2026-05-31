/* ==============================
   PRICING.JS — Zentic AI
   Billing toggle, FAQ accordion
   ============================== */

document.addEventListener('DOMContentLoaded', () => {
  initBillingToggle();
  initFAQ();
});

/* ===== BILLING TOGGLE ===== */
function initBillingToggle() {
  const toggle = document.getElementById('billingToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isAnnual = toggle.getAttribute('aria-checked') === 'true';
    toggle.setAttribute('aria-checked', !isAnnual);

    document.querySelectorAll('.pricing-amount').forEach(el => {
      const monthly = parseInt(el.getAttribute('data-monthly'));
      const annual = parseInt(el.getAttribute('data-annual'));
      el.textContent = isAnnual ? monthly : annual;
    });

    document.querySelectorAll('.pricing-period').forEach(el => {
      el.textContent = isAnnual ? '/month' : '/month';
    });

    // Update setup fee text
    document.querySelectorAll('.pricing-setup').forEach(el => {
      el.textContent = isAnnual ? '$400 setup fee' : '$400 setup fee';
    });
  });
}

/* ===== FAQ ACCORDION ===== */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Toggle is handled natively by <details>, but we prevent
      // any weird event propagation
      e.stopPropagation();
    });
  });
}
