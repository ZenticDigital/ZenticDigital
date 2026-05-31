/* ==============================
   HOME.JS — Zentic AI
   Home page specific scripts
   ============================== */

document.addEventListener('DOMContentLoaded', () => {
  initTestimonialSlider();
  initPortfolioHover();
});

/* ===== TESTIMONIAL SLIDER ===== */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (cards.length <= 3) return;

  let currentIndex = 0;
  const autoplayInterval = 5000;

  function goToSlide(index) {
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${index * cardWidth}px)`;
    currentIndex = index;
  }

  let autoplay = setInterval(() => {
    const next = (currentIndex + 1) % cards.length;
    goToSlide(next);
  }, autoplayInterval);

  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      const next = (currentIndex + 1) % cards.length;
      goToSlide(next);
    }, autoplayInterval);
  });
}

/* ===== PORTFOLIO HOVER EFFECT ===== */
function initPortfolioHover() {
  document.querySelectorAll('.portfolio-card').forEach(card => {
    const mockup = card.querySelector('.portfolio-mockup');

    card.addEventListener('mousemove', (e) => {
      if (!mockup) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mockup.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      if (!mockup) return;
      mockup.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    });
  });
}
