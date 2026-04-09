// ============================================================
// Enable JS-dependent animations
// ============================================================
document.documentElement.classList.add('js-loaded');

// ============================================================
// Countdown to 2026 reform (September 1, 2026)
// ============================================================
const countdownEl = document.getElementById('countdown-days');
if (countdownEl) {
  const reformDate = new Date('2026-09-01T00:00:00');
  const now = new Date();
  const diffMs = reformDate - now;
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  countdownEl.textContent = diffDays;
}

// ============================================================
// Urgency banner close
// ============================================================
const urgencyBanner = document.getElementById('urgency-banner');
const urgencyClose = document.getElementById('urgency-close');

if (urgencyBanner && urgencyClose) {
  urgencyClose.addEventListener('click', () => {
    urgencyBanner.classList.add('hidden');
  });
}

// ============================================================
// Smooth scroll navigation
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Close mobile nav if open
      closeMobileNav();
    }
  });
});

// ============================================================
// Sticky navbar shadow on scroll
// ============================================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ============================================================
// Mobile hamburger menu
// ============================================================
const hamburger = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobile-nav-overlay');

hamburger.addEventListener('click', () => {
  const isActive = hamburger.classList.toggle('active');
  mobileOverlay.classList.toggle('active', isActive);
  document.body.style.overflow = isActive ? 'hidden' : '';
});

function closeMobileNav() {
  hamburger.classList.remove('active');
  mobileOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close mobile nav when clicking a link
document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// ============================================================
// Scroll fade-in animations (Intersection Observer)
// ============================================================
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

fadeElements.forEach(el => fadeObserver.observe(el));

// ============================================================
// FAQ Accordion
// ============================================================
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');

    // Close all other items
    document.querySelectorAll('.faq-item.active').forEach(activeItem => {
      activeItem.classList.remove('active');
      activeItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!isActive) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

// ============================================================
// Contact form validation & submission
// ============================================================
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const btnSubmit = document.getElementById('btn-submit');
let lastSubmitTime = 0;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById('error-' + fieldId);
  field.classList.add('error');
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById('error-' + fieldId);
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
}

function clearAllErrors() {
  ['firstname', 'lastname', 'email', 'company-type', 'message'].forEach(clearFieldError);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();

  // Security: honeypot check
  const honeypot = document.getElementById('website');
  if (honeypot && honeypot.value) return;

  // Security: rate limiting (30s between submissions)
  const now = Date.now();
  if (now - lastSubmitTime < 30000) {
    const formSubmitError = document.getElementById('form-submit-error');
    formSubmitError.textContent = 'Veuillez patienter avant de renvoyer le formulaire.';
    formSubmitError.style.display = 'block';
    return;
  }

  const firstname = document.getElementById('firstname').value.trim();
  const lastname = document.getElementById('lastname').value.trim();
  const email = document.getElementById('email').value.trim();
  const companyType = document.getElementById('company-type').value;
  const message = document.getElementById('message').value.trim();

  let hasError = false;

  if (!firstname) {
    showFieldError('firstname', 'Le prénom est requis.');
    hasError = true;
  }
  if (!lastname) {
    showFieldError('lastname', 'Le nom est requis.');
    hasError = true;
  }
  if (!email) {
    showFieldError('email', "L'email est requis.");
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError('email', 'Veuillez entrer un email valide.');
    hasError = true;
  }
  if (!companyType) {
    showFieldError('company-type', 'Veuillez sélectionner votre profil.');
    hasError = true;
  }
  if (!message) {
    showFieldError('message', 'Veuillez décrire votre besoin.');
    hasError = true;
  }

  if (hasError) return;

  // Disable button
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Envoi en cours...';
  lastSubmitTime = now;

  const formSubmitError = document.getElementById('form-submit-error');
  formSubmitError.style.display = 'none';

  try {
    const formData = new FormData(contactForm);
    // Remove honeypot from submitted data
    formData.delete('website');

    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error('Formspree error');

    // Show success
    contactForm.style.display = 'none';
    formSuccess.style.display = 'block';
  } catch (err) {
    console.error('Form submission error:', err);
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Envoyer ma demande <span class="arrow">&rarr;</span>';
    formSubmitError.style.display = 'block';
  }
});

// Clear individual field errors on input
['firstname', 'lastname', 'email', 'message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => clearFieldError(id));
});
document.getElementById('company-type').addEventListener('change', () => clearFieldError('company-type'));
