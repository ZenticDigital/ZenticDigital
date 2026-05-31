/* ==============================
   SERVICES.JS — ZenticDigital
   Booking demo interaction
   ============================== */

document.addEventListener('DOMContentLoaded', () => {
  initBookingDemo();
});

function initBookingDemo() {
  const steps = document.querySelectorAll('.booking-demo-step');
  const serviceBtns = document.querySelectorAll('.booking-service-btn');
  const timeBtns = document.querySelectorAll('.booking-time-btn');
  const summary = document.getElementById('bookingSummary');

  let selectedService = '';
  let selectedTime = '';

  if (!steps.length) return;

  function goToStep(stepNum) {
    steps.forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.booking-demo-step[data-step="${stepNum}"]`);
    if (target) target.classList.add('active');
  }

  serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serviceBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedService = btn.getAttribute('data-service');
      updateSummary();
      setTimeout(() => goToStep(2), 400);
    });
  });

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      timeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = btn.textContent.trim();
      updateSummary();
      setTimeout(() => goToStep(3), 400);
    });
  });

  function updateSummary() {
    if (selectedService && selectedTime) {
      summary.textContent = `${selectedService} at ${selectedTime}`;
    } else if (selectedService) {
      summary.textContent = `${selectedService} — now pick a time`;
    }
  }
}
