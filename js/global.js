/* ==============================
   GLOBAL.JS — ZenticDigital
   Navigation, scroll reveals, particles, animations, chatbot
   ============================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initParticles();
  initCountUp();
  initSmoothScroll();
  initNavScrollEffects();
  initGoldDividers();
  initChatbot();
  initAnalytics();
});

/* ===== NAVIGATION ===== */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

/* ===== NAV SCROLL EFFECTS ===== */
function initNavScrollEffects() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    if (currentScroll > lastScroll && currentScroll > 300) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = parent.querySelectorAll(':scope > .reveal, :scope > .reveal-left, :scope > .reveal-right, :scope > .reveal-scale');
        const index = Array.from(siblings).indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.1}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => observer.observe(el));
}

/* ===== PARTICLES ===== */
function initParticles() {
  const containers = document.querySelectorAll('.particles-container');
  if (!containers.length) return;

  containers.forEach(container => {
    const count = Math.min(Math.floor(window.innerWidth / 8), 60);
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${12 + Math.random() * 18}s`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.width = `${1 + Math.random() * 2}px`;
      particle.style.height = particle.style.width;
      particle.style.opacity = `${0.1 + Math.random() * 0.3}`;
      container.appendChild(particle);
    }
  });
}

/* ===== COUNT UP ===== */
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ===== GOLD DIVIDERS ===== */
function initGoldDividers() {
  const dividers = document.querySelectorAll('.gold-divider');
  if (!dividers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('expanded');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  dividers.forEach(divider => observer.observe(divider));
}

/* ===== CHATBOT ===== */
function initChatbot() {
  const existing = document.querySelector('.chatbot-widget');
  if (existing) return;

  const widget = document.createElement('div');
  widget.className = 'chatbot-widget';
  widget.setAttribute('role', 'dialog');
  widget.setAttribute('aria-label', 'Chat with us');
  widget.innerHTML = `
    <button class="chatbot-toggle" aria-label="Open chat" aria-expanded="false">
      <span class="chatbot-toggle-icon">&#9993;</span>
    </button>
    <div class="chatbot-panel">
      <div class="chatbot-header">
        <span class="chatbot-header-name">ZenticDigital</span>
        <span class="chatbot-header-status">Online</span>
        <button class="chatbot-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chatbot-body">
        <div class="chatbot-msg bot">
          <div class="chatbot-bubble">Hi there! 👋 I'm the ZenticDigital assistant. How can I help you today?</div>
        </div>
      </div>
      <div class="chatbot-options" id="chatbotOptions">
        <button class="chatbot-option" data-answer="pricing">Pricing & Plans</button>
        <button class="chatbot-option" data-answer="timeline">Delivery Timeline</button>
        <button class="chatbot-option" data-answer="services">Our Services</button>
        <button class="chatbot-option" data-answer="contact">Contact Sales</button>
      </div>
      <div class="chatbot-footer">
        <input type="text" class="chatbot-input" placeholder="Type a message..." aria-label="Chat message">
        <button class="chatbot-send" aria-label="Send message">&rarr;</button>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  const toggle = widget.querySelector('.chatbot-toggle');
  const panel = widget.querySelector('.chatbot-panel');
  const close = widget.querySelector('.chatbot-close');
  const body = widget.querySelector('.chatbot-body');
  const input = widget.querySelector('.chatbot-input');
  const send = widget.querySelector('.chatbot-send');
  const optionsContainer = widget.querySelector('.chatbot-options');

  const responses = {
    pricing: `We offer three plans:\n\n<b>Essential</b> — $79/mo (3-page site)\n<b>Pro</b> — $149/mo (7-page site + booking + chatbot)\n<b>Elite</b> — $299/mo (unlimited pages + everything)\n\nAll plans include a one-time $400 setup fee. Check our <a href="pricing.html" style="color:var(--accent);text-decoration:underline;">pricing page</a> for details!`,
    timeline: `We deliver your first draft in <b>48 hours</b> after receiving your business details. Revisions take 1-3 days. Most sites go live within 5-7 days total. 🚀`,
    services: `We offer:\n\n• Custom Website Design\n• Booking System Integration\n• AI Chatbot\n• Local SEO Optimization\n• Monthly Maintenance & Hosting\n• Google Maps & Schema Markup\n\nSee all details on our <a href="services.html" style="color:var(--accent);text-decoration:underline;">services page</a>.`,
    contact: `You can reach us at:\n\n📧 <a href="mailto:hello@zenticdigital.com" style="color:var(--accent);text-decoration:underline;">hello@zenticdigital.com</a>\n📞 <a href="tel:+15550123" style="color:var(--accent);text-decoration:underline;">+1 (555) 0123</a>\n💬 <a href="https://wa.me/15550123" style="color:var(--accent);text-decoration:underline;">WhatsApp</a>\n\nOr fill out our <a href="contact.html" style="color:var(--accent);text-decoration:underline;">contact form</a> for a free demo!`
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isOpen);
    panel.classList.toggle('open');
    if (!isOpen) {
      body.scrollTop = body.scrollHeight;
      input.focus();
    }
  });

  close.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
  });

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chatbot-msg ${sender}`;
    div.innerHTML = `<div class="chatbot-bubble">${text}</div>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function handleUserInput(value) {
    const text = value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    optionsContainer.style.display = 'none';

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '';

      if (lower.includes('price') || lower.includes('cost') || lower.includes('plan') || lower.includes('pricing')) {
        reply = responses.pricing;
      } else if (lower.includes('time') || lower.includes('day') || lower.includes('48') || lower.includes('hour') || lower.includes('how long') || lower.includes('delivery') || lower.includes('timeline')) {
        reply = responses.timeline;
      } else if (lower.includes('service') || lower.includes('offer') || lower.includes('do you') || lower.includes('website') || lower.includes('seo') || lower.includes('booking') || lower.includes('chatbot')) {
        reply = responses.services;
      } else if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('call') || lower.includes('demo') || lower.includes('talk') || lower.includes('human') || lower.includes('sales')) {
        reply = responses.contact;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good')) {
        reply = `Hello! 👋 Welcome to ZenticDigital. How can I help you today? You can ask about our pricing, services, timeline, or contact info.`;
      } else if (lower.includes('thank')) {
        reply = `You're welcome! 😊 If you have any other questions, just ask. Or <a href="contact.html" style="color:var(--accent);text-decoration:underline;">get your free demo here</a>!`;
      } else {
        reply = `Great question! Here's what I can help with:\n\n• <b>Pricing</b> — plans starting at $79/mo\n• <b>Timeline</b> — delivered in 48 hours\n• <b>Services</b> — websites, SEO, chatbots\n• <b>Contact</b> — talk to our team\n\nOr just ask me anything!`;
      }

      addMessage(reply, 'bot');
      optionsContainer.style.display = 'flex';
    }, 600);
  }

  optionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.chatbot-option');
    if (!btn) return;
    const answer = btn.getAttribute('data-answer');
    if (responses[answer]) {
      addMessage(btn.textContent, 'user');
      optionsContainer.style.display = 'none';
      setTimeout(() => {
        addMessage(responses[answer], 'bot');
        optionsContainer.style.display = 'flex';
      }, 500);
    }
  });

  send.addEventListener('click', () => handleUserInput(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserInput(input.value);
  });
}

/* ===== ANALYTICS ===== */
function initAnalytics() {
  // Google Analytics placeholder — replace G-XXXXXXXXXX with your GA4 ID
  // window.dataLayer = window.dataLayer || [];
  // function gtag(){dataLayer.push(arguments);}
  // gtag('js', new Date());
  // gtag('config', 'G-XXXXXXXXXX');
}
