// ============================================================
// Enable JS-dependent animations
// ============================================================
document.documentElement.classList.add('js-loaded');

// ============================================================
// Supabase Configuration
// ============================================================
const SUPABASE_URL = 'https://lqmtugoubczposyktxtz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbXR1Z291YmN6cG9zeWt0eXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTU5NzMsImV4cCI6MjA5MDgzMTk3M30.lqz2bh6YAaErxiv6gS_zurAaqqNZqq0GNHmVdJkwr5w';

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase not available:', e);
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

  try {
    if (!supabaseClient) throw new Error('Supabase non disponible');
    const { error } = await supabaseClient.from('contacts').insert({
      firstname,
      lastname,
      email,
      company_type: companyType,
      message
    });

    if (error) throw error;

    // Show success
    contactForm.style.display = 'none';
    formSuccess.style.display = 'block';
  } catch (err) {
    console.error('Form submission error:', err);
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Envoyer ma demande <span class="arrow">&rarr;</span>';
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
});

// Clear individual field errors on input
['firstname', 'lastname', 'email', 'message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => clearFieldError(id));
});
document.getElementById('company-type').addEventListener('change', () => clearFieldError('company-type'));

// ============================================================
// Guide CTA — Stripe placeholder
// ============================================================
document.getElementById('btn-guide').addEventListener('click', (e) => {
  e.preventDefault();
  // TODO: Replace with Stripe Checkout redirect
  // Example: window.location.href = 'https://checkout.stripe.com/pay/xxx';
  alert('Redirection vers le paiement Stripe (à configurer).');
});
