/* ==========================================================================
   الواحة الخضراء — سكربت صفحة الهبوط
   كل الأرقام والنصوص المتغيرة موجودة في CONFIG تحت 👇
   ========================================================================== */

const CONFIG = {
  // رقم الجوال بصيغة دولية (يُستخدم في زر الاتصال)
  phoneE164: '+966500000000',
  // نفس الرقم للعرض على الصفحة
  phoneDisplay: '0500 000 000',
  // رقم الواتساب بصيغة دولية بدون + وبدون أصفار
  whatsapp: '966500000000',
  // رسالة الواتساب الافتراضية
  whatsappMessage: 'السلام عليكم، أرغب بالاستفسار عن خدمة تنسيق حدائق.',
  // مسار الـ API لحفظ الطلبات
  apiUrl: '/api/lead',
};

/* --------------------------------- أدوات --------------------------------- */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('966')) digits = '0' + digits.slice(3);
  if (digits.startsWith('5') && digits.length === 9) digits = '0' + digits;
  return digits;
}

function whatsappLink(message) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
}

/* ------------------------------- الروابط -------------------------------- */

function applyContactLinks() {
  $$('[data-tel]').forEach((link) => { link.setAttribute('href', `tel:${CONFIG.phoneE164}`); });
  $$('[data-phone-display]').forEach((el) => { el.textContent = CONFIG.phoneDisplay; });
  $$('[data-wa]').forEach((link) => {
    link.setAttribute('href', whatsappLink(CONFIG.whatsappMessage));
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
  });

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ------------------------------ قائمة الجوال ----------------------------- */

function setupNav() {
  const toggle = $('#navToggle');
  const nav = $('#nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  $$('a', nav).forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

/* --------------------------- زر "اطلب هذه الخدمة" -------------------------- */

function setupServiceButtons() {
  $$('[data-service]').forEach((button) => {
    button.addEventListener('click', () => {
      const service = button.getAttribute('data-service');
      $$('#heroForm select[name="service"], #leadForm select[name="service"]').forEach((select) => {
        const option = Array.from(select.options).find((opt) => opt.value === service || opt.textContent.trim() === service);
        if (option) select.value = option.value || option.textContent.trim();
      });

      const target = $('#quote');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(`اخترنا لك: ${service} — أكمل بياناتك ونتواصل معك.`);
    });
  });
}

/* ------------------------------ النماذج --------------------------------- */

function setFieldError(field, hasError) {
  const wrapper = field.closest('[data-field]');
  if (wrapper) wrapper.classList.toggle('field--error', hasError);
}

function validateForm(form) {
  const errors = [];
  $$('.field--error', form).forEach((el) => el.classList.remove('field--error'));

  const name = form.elements.name;
  const phone = form.elements.phone;
  const city = form.elements.city;
  const service = form.elements.service;

  if (!name.value.trim() || name.value.trim().length < 2) { setFieldError(name, true); errors.push(name); }
  if (!/^05\d{8}$/.test(normalizePhone(phone.value))) { setFieldError(phone, true); errors.push(phone); }
  if (!city.value) { setFieldError(city, true); errors.push(city); }
  if (!service.value) { setFieldError(service, true); errors.push(service); }

  if (errors.length) {
    errors[0].focus();
    showToast('تحقّق من البيانات المطلوبة بالأحمر.');
    return null;
  }

  return {
    name: name.value.trim(),
    phone: normalizePhone(phone.value),
    city: city.value,
    service: service.value,
    area: form.elements.area ? form.elements.area.value : '',
    notes: form.elements.notes ? form.elements.notes.value.trim() : '',
    source: form.getAttribute('data-source') || 'form',
  };
}

function showSuccess(form, lead, id) {
  const details = [
    'السلام عليكم، أرسلت طلب عرض سعر من الموقع:',
    `الاسم: ${lead.name}`,
    `المدينة: ${lead.city}`,
    `الخدمة: ${lead.service}`,
    lead.area ? `المساحة: ${lead.area}` : '',
    lead.notes ? `تفاصيل: ${lead.notes}` : '',
  ].filter(Boolean).join('\n');

  const panel = document.createElement('div');
  panel.className = 'form-success';
  panel.innerHTML = `
    <div class="form-success__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="#14624a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
    <h3>تم استلام طلبك 🌿</h3>
    <p>طلبك رقم <strong>${id}</strong> — بنتواصل معك خلال ٣٠ دقيقة لتحديد موعد المعاينة المجانية.</p>
    <a class="btn btn--wa btn--block" href="${whatsappLink(details)}" target="_blank" rel="noopener">أرسل التفاصيل على واتساب (أسرع)</a>
    <p class="form__privacy">لو ما وصلك اتصال خلال ساعة، راسلنا على الواتساب مباشرة.</p>
  `;

  form.hidden = true;
  form.insertAdjacentElement('afterend', panel);
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setupForm(form) {
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = $('button[type="submit"]', form);
    const lead = validateForm(form);
    if (!lead) return;

    const originalText = submitButton ? submitButton.textContent : '';
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'جارٍ الإرسال…'; }

    try {
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذّر إرسال الطلب.');
      }

      showSuccess(form, lead, result.id || '');
    } catch (error) {
      showToast('ما قدرنا نحفظ طلبك. تحقق من اتصالك أو راسلنا على واتساب مباشرة.');
      const fallback = form.querySelector('.form-fallback');
      if (!fallback) {
        const link = document.createElement('a');
        link.className = 'btn btn--wa btn--block form-fallback';
        link.style.marginTop = '12px';
        link.href = whatsappLink(`السلام عليكم، أرغب بعرض سعر.\nالاسم: ${lead.name}\nالمدينة: ${lead.city}\nالخدمة: ${lead.service}`);
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'أرسل الطلب على واتساب مباشرة';
        form.appendChild(link);
      }
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = originalText; }
    }
  });
}

/* ---------------------------- ظهور تدريجي للأقسام --------------------------- */

function setupReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach((item) => observer.observe(item));
}

/* --------------------------------- إقلاع -------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  applyContactLinks();
  setupNav();
  setupServiceButtons();
  setupForm($('#heroForm'));
  setupForm($('#leadForm'));
  setupReveal();
});
