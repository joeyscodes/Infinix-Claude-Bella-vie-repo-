/* ============================================================
   BELLA VIE SALON & SPA — Core Interaction Script
   Handles: loader, header state, mobile nav, scroll reveals,
   parallax, animated counters, marquee duplication, back-to-top,
   forms (mailto/WhatsApp handoff), footer year.
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. PAGE LOADER
     --------------------------------------------------------- */
  const loader = document.querySelector('.loader');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-hidden');
    setTimeout(() => loader.remove(), 800);
  }
  window.addEventListener('load', () => setTimeout(hideLoader, 350));
  // Safety fallback in case load event is delayed
  setTimeout(hideLoader, 2500);

  /* ---------------------------------------------------------
     2. HEADER SCROLL STATE
     --------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------------------------------------------------------
     3. MOBILE NAV TOGGLE
     --------------------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.classList.toggle('is-active', isOpen);
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     4. SCROLL REVEAL (IntersectionObserver)
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el, i) => {
      if (!el.style.getPropertyValue('--delay')) {
        el.style.setProperty('--delay', (i % 6) * 0.09 + 's');
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Thread underline trigger (uses same observer pattern independently)
  const threadEls = document.querySelectorAll('.thread');
  if ('IntersectionObserver' in window && threadEls.length) {
    const threadIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            threadIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    threadEls.forEach((el) => threadIO.observe(el));
  } else {
    threadEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------------
     5. PARALLAX (hero media + floating decorative layers)
     --------------------------------------------------------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  let ticking = false;
  function applyParallax() {
    const scY = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const rect = el.closest('section') ? el.closest('section').getBoundingClientRect() : el.getBoundingClientRect();
      // Only animate near viewport for performance
      if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
        const offset = scY * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
      }
    });
    ticking = false;
  }
  function onScrollParallax() {
    if (!ticking && !prefersReducedMotion) {
      window.requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }
  if (parallaxEls.length && !prefersReducedMotion) {
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    applyParallax();
  }

  /* ---------------------------------------------------------
     6. ANIMATED COUNTERS
     --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    const cIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cIO.observe(el));
  }

  /* ---------------------------------------------------------
     7. MARQUEE — duplicate track content for seamless loop
     --------------------------------------------------------- */
  document.querySelectorAll('.marquee-track').forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---------------------------------------------------------
     8. BACK TO TOP
     --------------------------------------------------------- */
  document.querySelectorAll('[data-back-to-top]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     9. FOOTER YEAR
     --------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------
     10. BOOKING FORM — Joe's Web Studio Booking API (primary) + WhatsApp (secondary)
     --------------------------------------------------------- */
  function buildWhatsAppText(form) {
    const data = new FormData(form);
    const name = data.get('name') || '';
    const phone = data.get('phone') || '';
    const service = data.get('service') || '';
    const date = data.get('date') || '';
    const message = data.get('message') || '';
    return (
      `Hello Bella Vie Salon & Spa, I'd like to book an appointment.%0A` +
      `Name: ${encodeURIComponent(name)}%0A` +
      `Phone: ${encodeURIComponent(phone)}%0A` +
      `Service: ${encodeURIComponent(service)}%0A` +
      `Preferred date: ${encodeURIComponent(date)}%0A` +
      `Notes: ${encodeURIComponent(message)}`
    );
  }

  const BOOKING_API_URL = 'https://joes-web-studio-booking-platform.joeysdigitaltools-github.workers.dev/api/v1/booking';
  const BOOKING_API_KEY = 'jws_live_7L-Y0ppL-bzwwNUyVzJa81yJ-2h56EfeShmUgW3eiBM';

  const bookingForm = document.querySelector('#booking-form');
  const bookingStatus = document.querySelector('#booking-status');
  const bookingWhatsAppBtn = document.querySelector('#booking-whatsapp-btn');
  const waNumber = '971509629095';
  let isBookingSubmitting = false;

  function setBookingStatus(message, kind) {
    if (!bookingStatus) return;
    bookingStatus.textContent = message;
    bookingStatus.className = kind ? `form-status is-${kind}` : 'form-status';
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isBookingSubmitting) return; // guard against duplicate submissions

      // Keep existing client-side validation (required fields, email/tel types)
      // and highlight invalid fields the same way the browser already does.
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      const submitBtn = bookingForm.querySelector('#booking-submit-btn');
      const btnLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;
      const data = new FormData(bookingForm);

      const payload = {
        client: {
          apiKey: BOOKING_API_KEY
        },
        booking: {
          name: (data.get('name') || '').toString().trim(),
          email: (data.get('email') || '').toString().trim(),
          phone: (data.get('phone') || '').toString().trim(),
          service: (data.get('service') || '').toString().trim(),
          date: (data.get('date') || '').toString().trim(),
          message: (data.get('message') || '').toString().trim()
        }
      };

      isBookingSubmitting = true;
      if (submitBtn) submitBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = 'Sending...';
      setBookingStatus('', null);

      try {
        const res = await fetch(BOOKING_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Safely parse JSON — the API may return an empty or non-JSON body on some errors.
        let result = null;
        try {
          result = await res.json();
        } catch (parseErr) {
          result = null;
        }

        if (res.ok) {
          bookingForm.reset();
          setBookingStatus(
            '✅ Thank you! Your appointment request has been received successfully. Our team will contact you shortly to confirm your booking.',
            'success'
          );
        } else {
          const friendlyMessage =
            (result && (result.message || result.error)) ||
            'We couldn\u2019t send your booking request right now. Please try again, or message us on WhatsApp below.';
          setBookingStatus(friendlyMessage, 'error');
        }
      } catch (networkErr) {
        // Network failure (offline, DNS, CORS, etc.) — never expose technical details.
        setBookingStatus(
          'We couldn\u2019t reach our booking system. Please check your connection and try again, or message us on WhatsApp below.',
          'error'
        );
      } finally {
        isBookingSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = 'Send Booking Request';
      }
    });
  }

  if (bookingWhatsAppBtn && bookingForm) {
    bookingWhatsAppBtn.addEventListener('click', () => {
      window.open(`https://wa.me/${waNumber}?text=${buildWhatsAppText(bookingForm)}`, '_blank');
    });
  }

  /* ---------------------------------------------------------
     10b. GENERAL CONTACT FORM — Formspree
     --------------------------------------------------------- */
  const contactForm = document.querySelector('#contact-form');
  const contactStatus = document.querySelector('#contact-status');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isPlaceholder = contactForm.action.includes('YOUR_FORM_ID');
      const submitBtn = contactForm.querySelector('#contact-submit-btn');

      if (isPlaceholder) {
        const data = new FormData(contactForm);
        const name = data.get('name') || '';
        const email = data.get('email') || '';
        const message = data.get('message') || '';
        const subject = encodeURIComponent(`Website enquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:info@bellavie.ae?subject=${subject}&body=${body}`;
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      if (contactStatus) { contactStatus.textContent = ''; contactStatus.className = 'form-status'; }

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          contactForm.reset();
          if (contactStatus) {
            contactStatus.textContent = 'Thanks for reaching out — we\u2019ll reply within one business day.';
            contactStatus.className = 'form-status is-success';
          }
        } else {
          throw new Error('Formspree error');
        }
      } catch (err) {
        if (contactStatus) {
          contactStatus.textContent = 'Something went wrong sending your message. Please email us directly.';
          contactStatus.className = 'form-status is-error';
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      }
    });
  }

  /* ---------------------------------------------------------
     11. CURRENT NAV LINK HIGHLIGHT
     --------------------------------------------------------- */
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------------------------------------------------------
     12. LANGUAGE TOGGLE (EN / AR)
     --------------------------------------------------------- */
  const translations = {
    "nav.home": { ar: "الرئيسية" },
    "nav.about": { ar: "من نحن" },
    "nav.services": { ar: "الخدمات" },
    "nav.gallery": { ar: "المعرض" },
    "nav.contact": { ar: "تواصل معنا" },
    "nav.book": { ar: "احجزي الآن" },
    "footer.quicklinks": { ar: "روابط سريعة" },
    "footer.aboutus": { ar: "من نحن" },
    "footer.services": { ar: "الخدمات" },
    "footer.visitus": { ar: "زورينا" },
    "footer.hair": { ar: "فن تصفيف الشعر" },
    "footer.color": { ar: "الصبغة والبالياج" },
    "footer.facials": { ar: "العناية بالبشرة" },
    "footer.body": { ar: "علاجات الجسم" },
    "footer.desc": { ar: "ملاذ فاخر وهادئ لتحويلات الشعر والبشرة والجسم في قلب البرشاء، دبي." },
    "footer.backtotop": { ar: "العودة للأعلى" },
    "home.eyebrow": { ar: "البرشاء · دبي · ملاذ فاخر" },
    "home.title": { ar: "حيث يلتقي الجمال<br>بـ<em>الفخامة</em>" },
    "home.sub": { ar: "ادخلي إلى ملاذ هادئ صُمم لتحوّلك — فن شعر احترافي، علاجات بشرة مشرقة، وعلاجات جسم منعشة، بلمسة فاخرة وهادئة." },
    "home.bookbtn": { ar: "احجزي موعدك" },
    "home.callbtn": { ar: "اتصلي بالصالون" },
    "home.scroll": { ar: "مرري للأسفل" },
    "about.eyebrow": { ar: "قصتنا" },
    "about.title": { ar: "القلب وراء<br>بيلا في" },
    "services.eyebrow": { ar: "القائمة والأسعار" },
    "services.title": { ar: "علاجات مصممة<br>من أجلك" },
    "gallery.eyebrow": { ar: "داخل بيلا في" },
    "gallery.title": { ar: "مساحة صُممت<br>للسكينة" },
    "contact.eyebrow": { ar: "تواصلي معنا" },
    "contact.title": { ar: "لنخطط لزيارتك" },
    "trust.google": { ar: "تقييمات جوجل" },
    "trust.clients": { ar: "عميلة سعيدة" },
    "trust.followers": { ar: "متابع على إنستغرام" },
    "trust.response": { ar: "رد سريع عبر واتساب" }
  };

  const langToggles = document.querySelectorAll('#lang-toggle');
  function applyLanguage(lang) {
    const isAr = lang === 'ar';
    document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const entry = translations[key];
      if (!entry) return;
      if (isAr) {
        if (!el.dataset.enOriginal) el.dataset.enOriginal = el.textContent;
        el.textContent = entry.ar;
      } else {
        el.textContent = el.dataset.enOriginal || el.textContent;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const entry = translations[key];
      if (!entry) return;
      if (isAr) {
        if (!el.dataset.enOriginal) el.dataset.enOriginal = el.innerHTML;
        el.innerHTML = entry.ar;
      } else {
        el.innerHTML = el.dataset.enOriginal || el.innerHTML;
      }
    });

    try { localStorage.setItem('bv-lang', isAr ? 'ar' : 'en'); } catch (e) { /* storage unavailable */ }
  }

  if (langToggles.length) {
    let current = 'en';
    try { current = localStorage.getItem('bv-lang') || 'en'; } catch (e) { /* ignore */ }
    applyLanguage(current);
    langToggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        current = current === 'ar' ? 'en' : 'ar';
        applyLanguage(current);
      });
    });
  }

})();

/* ============================================================
   13. CINEMATIC WORD-STAGGER TITLE REVEAL
     Runs after language init so it always wraps final text.
   ============================================================ */
(function () {
  'use strict';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  function wordReveal(el) {
    if (!el || el.dataset.wordRevealed) return;
    el.dataset.wordRevealed = 'true';
    const html = el.innerHTML.trim();
    const lineParts = html.split(/(<br\s*\/?>)/i);
    let counter = 0;
    const rebuilt = lineParts.map((part) => {
      if (/^<br/i.test(part)) return part;
      return part
        .split(' ')
        .filter((w) => w.length)
        .map((word) => {
          const delay = (counter++ * 0.09).toFixed(2);
          return `<span class="word-reveal"><span style="animation-delay:${delay}s">${word}</span></span>`;
        })
        .join(' ');
    });
    el.innerHTML = rebuilt.join('');
  }

  document.querySelectorAll('.hero-title, .page-hero h1').forEach(wordReveal);
})();

/* ============================================================
   14. CUSTOM CURSOR GLOW (desktop, fine pointer only)
   ============================================================ */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let raf = null;
  window.addEventListener('mousemove', (e) => {
    glow.classList.add('is-active');
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      raf = null;
    });
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .card, input, select, textarea')) {
      glow.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .card, input, select, textarea')) {
      glow.classList.remove('is-hovering');
    }
  });
  document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
})();

/* ============================================================
   15. MAGNETIC BUTTON HOVER
   ============================================================ */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.btn-gold, .btn-primary').forEach((btn) => {
    btn.classList.add('btn-magnetic');
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   16. GALLERY LIGHTBOX
     Works with any element carrying data-lightbox-group="X" — new
     gallery tiles are picked up automatically, no JS changes needed.
   ============================================================ */
(function () {
  'use strict';
  const triggers = Array.from(document.querySelectorAll('[data-lightbox-group]'));
  if (!triggers.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg>
    </button>
    <button class="lightbox-prev" aria-label="Previous image">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button class="lightbox-next" aria-label="Next image">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <figure>
      <img src="" alt="">
      <figcaption></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('img');
  const captionEl = overlay.querySelector('figcaption');
  let currentIndex = 0;

  function openAt(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const src = trigger.querySelector('img').getAttribute('src');
    const caption = trigger.dataset.caption || trigger.querySelector('img').getAttribute('alt') || '';
    imgEl.setAttribute('src', src);
    imgEl.setAttribute('alt', caption);
    captionEl.textContent = caption;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger, i) => {
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.addEventListener('click', () => openAt(i));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i); }
    });
  });

  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  overlay.querySelector('.lightbox-prev').addEventListener('click', () => openAt(currentIndex - 1));
  overlay.querySelector('.lightbox-next').addEventListener('click', () => openAt(currentIndex + 1));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') openAt(currentIndex - 1);
    if (e.key === 'ArrowRight') openAt(currentIndex + 1);
  });
})();
