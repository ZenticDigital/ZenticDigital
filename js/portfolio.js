/* ==============================
   PORTFOLIO.JS — Zentic AI
   Filtering and interactions
   ============================== */

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilters();
  initPortfolioTilt();
});

/* ===== FILTERS ===== */
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card-full');

  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
          });
        } else {
          card.classList.add('hidden');
        }
      });

      // Re-trigger reveal for visible cards
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.portfolio-card-full:not(.hidden) .reveal').forEach(el => {
        revealObserver.observe(el);
      });
    });
  });
}

/* ===== TILT EFFECT ===== */
function initPortfolioTilt() {
  document.querySelectorAll('.portfolio-card-full').forEach(card => {
    const mockup = card.querySelector('.portfolio-mockup-full');

    card.addEventListener('mousemove', (e) => {
      if (!mockup) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mockup.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      if (!mockup) return;
      mockup.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  });
}
