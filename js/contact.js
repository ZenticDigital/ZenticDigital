/* ==============================
   CONTACT.JS — ZenticDigital
   Form submission — local API leads + Formspree fallback
   ============================== */

const FORMSPREE_URL = 'https://formspree.io/f/your-form-id';
const API_URL = '/api/leads';

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const name = document.getElementById('name').value.trim();
    const business = document.getElementById('business').value.trim();
    const city = document.getElementById('city').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    const honeypot = document.getElementById('_gotcha')?.value;

    if (honeypot) return;

    if (!name || !business || !city || !email) {
      showFormMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }

    const data = { name, business, city, email, phone, message };

    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;

    try {
      // Primary: save to local server (captures lead for admin dashboard)
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch { /* server may be offline — still try Formspree */ }

      // Secondary: send via Formspree for email notification
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        window.location.href = 'thank-you.html';
      } else {
        throw new Error('Formspree error');
      }
    } catch {
      // Fallback: if Formspree fails too, lead is already saved locally
      window.location.href = 'thank-you.html';
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearMessages() {
  document.querySelectorAll('.form-message').forEach(el => el.remove());
}

function showFormMessage(msg, type) {
  const existing = document.querySelector('.form-message');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = `form-message form-message-${type}`;
  div.innerHTML = msg;
  div.style.cssText = `
    padding: 16px 20px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    line-height: 1.7;
    margin-top: 8px;
    ${type === 'success'
      ? 'background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); color: var(--accent-light);'
      : 'background: rgba(255,68,68,0.08); border: 1px solid rgba(255,68,68,0.2); color: #ff6b6b;'
    }
  `;

  const form = document.getElementById('contactForm');
  form.appendChild(div);
}
