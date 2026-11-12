/**
 * Smooth & Elegant Scroll System for Abinash Portfolio
 * Features:
 * 1. Natural fluid scrolling for navigation links and section jumps
 * 2. Offset calculation accounting for sticky/fixed navbar
 * 3. High-performance scroll-triggered reveals using IntersectionObserver
 * 4. Staggered reveals for cards, skills, and certifications
 * 5. Accurate active navigation scrollspy with instant mobile sync
 * 6. Full prefers-reduced-motion accessibility support
 */

(function () {
  'use strict';

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. Helper Utilities
     ========================================================================== */

  // Get current sticky header height dynamically
  function getStickyHeaderHeight() {
    const header = document.getElementById('sticky-header');
    if (!header) return 80;
    const rect = header.getBoundingClientRect();
    return Math.max(rect.height, 70);
  }

  // Calculate target scroll position with generous breathing room
  function getTargetScrollTop(targetEl) {
    if (!targetEl) return 0;
    const headerHeight = getStickyHeaderHeight();
    const rect = targetEl.getBoundingClientRect();
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add 16px padding below the header so section title is cleanly framed
    const offset = headerHeight + 16;
    return Math.max(0, rect.top + currentScroll - offset);
  }

  /* ==========================================================================
     2. Fluid Smooth Scroll Engine
     ========================================================================== */

  let activeScrollAnim = null;

  // Cancel any ongoing smooth scroll if user interacts
  function cancelActiveScroll() {
    if (activeScrollAnim) {
      cancelAnimationFrame(activeScrollAnim);
      activeScrollAnim = null;
    }
  }

  window.addEventListener('wheel', cancelActiveScroll, { passive: true });
  window.addEventListener('touchstart', cancelActiveScroll, { passive: true });
  window.addEventListener('keydown', function (e) {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
      cancelActiveScroll();
    }
  }, { passive: true });

  // Custom cubic ease-out for natural, premium deceleration
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Smooth scroll to target Y position
  function scrollToPosition(targetY, duration, callback) {
    cancelActiveScroll();

    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      if (callback) callback();
      return;
    }

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const diff = targetY - startY;

    // If already at or very near target, no animation needed
    if (Math.abs(diff) < 3) {
      if (callback) callback();
      return;
    }

    // Dynamic duration based on distance (min 500ms, max 850ms)
    const animDuration = duration || Math.min(Math.max(Math.abs(diff) * 0.42, 520), 850);
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      const ease = easeOutCubic(progress);

      window.scrollTo(0, startY + diff * ease);

      if (progress < 1) {
        activeScrollAnim = requestAnimationFrame(step);
      } else {
        activeScrollAnim = null;
        if (callback) callback();
      }
    }

    activeScrollAnim = requestAnimationFrame(step);
  }

  /* ==========================================================================
     3. Smooth Anchor Click Handler
     ========================================================================== */

  function initSmoothAnchorNavigation() {
    // Intercept clicks on on-page anchor links and navigation
    document.addEventListener('click', function (e) {
      // Find closest anchor tag
      const link = e.target.closest('a');
      if (!link) return;

      // Ignore bootstrap tab toggles or modals
      if (link.getAttribute('data-bs-toggle') || link.getAttribute('role') === 'tab') {
        return;
      }

      const href = link.getAttribute('href');
      if (!href) return;

      // Check if clicking "Home" link when already on home page
      const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
      if (isHomePage && (href === 'index.html' || href === '#home' || href === '#')) {
        e.preventDefault();
        closeMobileMenu();
        scrollToPosition(0);
        updateActiveNav('home');
        return;
      }

      // Check for on-page hash link
      if (href.startsWith('#') && href.length > 1) {
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId) || 
          (targetId === 'servicesSection' ? document.getElementById('services') : null) || 
          (targetId === 'services' ? document.getElementById('servicesSection') : null) || 
          document.querySelector(`[name="${targetId}"]`);
        
        if (targetEl) {
          e.preventDefault();
          closeMobileMenu();
          const targetY = getTargetScrollTop(targetEl);
          scrollToPosition(targetY, null, function () {
            // Update URL hash without causing a browser jump
            if (history.pushState) {
              history.pushState(null, null, '#' + targetId);
            }
          });
          updateActiveNav(targetId);
          return;
        }
      }

      // Check for back-to-top button
      if (link.classList.contains('scroll-to-target') || link.closest('.scroll-to-target')) {
        e.preventDefault();
        scrollToPosition(0);
        return;
      }
    });

    // Handle initial hash on page load (e.g. index.html#servicesSection)
    if (window.location.hash && window.location.hash.length > 1) {
      const hashId = window.location.hash.substring(1);
      setTimeout(function () {
        const targetEl = document.getElementById(hashId);
        if (targetEl) {
          const targetY = getTargetScrollTop(targetEl);
          scrollToPosition(targetY);
        }
      }, 250);
    }
  }

  // Close mobile navigation drawer
  function closeMobileMenu() {
    if (document.body.classList.contains('mobile-menu-visible')) {
      document.body.classList.remove('mobile-menu-visible');
    }
  }

  /* ==========================================================================
     4. Scrollspy: Active Navigation Highlight
     ========================================================================== */

  const SECTION_NAV_MAP = [
    { id: 'home', navKeys: ['home', 'index.html'] },
    { id: 'aboutSection', navKeys: ['aboutSection', 'about.html', 'about'] },
    { id: 'servicesSection', navKeys: ['servicesSection', 'services'] },
    { id: 'portfolioSection', navKeys: ['portfolioSection', 'portfolio'] },
    { id: 'processSection', navKeys: ['portfolioSection', 'process'] },
    { id: 'contact', navKeys: ['contact'] },
    { id: 'thankYouSection', navKeys: ['contact'] }
  ];

  function updateActiveNav(activeId) {
    const navItems = document.querySelectorAll('.navigation > li, .mobile__menu .menu__outer ul > li');
    const headerBtn = document.querySelector('.header__btn a[href="#contact"]');

    // Find mapped navigation keys
    let matchedKeys = [activeId];
    for (let i = 0; i < SECTION_NAV_MAP.length; i++) {
      if (SECTION_NAV_MAP[i].id === activeId) {
        matchedKeys = SECTION_NAV_MAP[i].navKeys;
        break;
      }
    }

    navItems.forEach(li => {
      const link = li.querySelector('a');
      if (!link) return;

      const href = (link.getAttribute('href') || '').toLowerCase();
      const hrefClean = href.replace(/^.*#/, '').replace('.html', '');

      let isActive = false;
      for (let k = 0; k < matchedKeys.length; k++) {
        const key = matchedKeys[k].toLowerCase();
        if (hrefClean === key || href === '#' + key || href === key || (key === 'home' && (href === 'index.html' || href === '#home' || href === '#'))) {
          isActive = true;
          break;
        }
      }

      if (isActive) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });

    // Update Header Contact button active state
    if (headerBtn) {
      if (activeId === 'contact' || activeId === 'thankYouSection') {
        headerBtn.classList.add('nav-contact-active');
      } else {
        headerBtn.classList.remove('nav-contact-active');
      }
    }
  }

  function initScrollSpy() {
    const sections = [];

    // Collect all existing sections on page
    SECTION_NAV_MAP.forEach(item => {
      let el = document.getElementById(item.id);
      if (!el && item.id === 'servicesSection') {
        el = document.getElementById('services');
      } else if (!el && item.id === 'home') {
        el = document.querySelector('.banner');
      }
      if (el) {
        sections.push({ id: item.id, element: el });
      }
    });

    if (!sections.length) return;

    let ticking = false;

    function onScrollSpy() {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    }

    function checkActiveSection() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const headerHeight = getStickyHeaderHeight();

      // If scrolled near the bottom of page, highlight contact
      if (scrollY + viewportHeight >= docHeight - 75) {
        updateActiveNav('contact');
        return;
      }

      // If at top of page, highlight home
      if (scrollY < 180) {
        updateActiveNav('home');
        return;
      }

      // Check which section is in focus (middle of the viewport)
      const focusPoint = scrollY + headerHeight + (viewportHeight * 0.35);

      let currentSectionId = sections[0].id;
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const top = sec.element.getBoundingClientRect().top + scrollY;
        const bottom = top + sec.element.offsetHeight;

        if (focusPoint >= top && focusPoint < bottom) {
          currentSectionId = sec.id;
          break;
        }
      }

      updateActiveNav(currentSectionId);
    }

    window.addEventListener('scroll', onScrollSpy, { passive: true });
    window.addEventListener('resize', onScrollSpy, { passive: true });

    // Initial check
    checkActiveSection();
  }

  /* ==========================================================================
     5. Scroll-Triggered Content Reveals (Intersection Observer)
     ========================================================================== */

  function initScrollReveals() {
    // If user prefers reduced motion, reveal everything immediately
    if (prefersReducedMotion) {
      document.querySelectorAll('.scroll-reveal, .scroll-reveal--heading, .scroll-reveal--text, .scroll-reveal--card, .scroll-reveal--img').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // Auto-discover and tag content elements across sections with restrained reveal classes
    setupRevealElements();

    // Setup high-performance IntersectionObserver
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: [0.1]
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    const elementsToObserve = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal--heading, .scroll-reveal--text, .scroll-reveal--card, .scroll-reveal--img'
    );

    elementsToObserve.forEach(el => {
      // If element is already in the viewport upon load, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-revealed');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  // Automatically tag existing section content with reveal classes
  function setupRevealElements() {
    // 1. Section Headings & Subtitles
    const headings = document.querySelectorAll(
      '.about__headline, .services-interactive__heading, .services-clean__title, .section__title .title, .process__title, .pcontact-title, .thank-you__heading, .about-hero__heading'
    );
    headings.forEach(h => {
      if (!h.classList.contains('scroll-reveal--heading')) {
        h.classList.add('scroll-reveal--heading');
      }
    });

    const subtitles = document.querySelectorAll(
      '.about__header-wrap, .services-interactive__eyebrow, .services-clean__tag-wrap, .section__title .sub-title, .process__tag-wrap, .pcontact-tagline-wrap, .thank-you__eyebrow, .about-hero__label-wrap'
    );
    subtitles.forEach(s => {
      if (!s.classList.contains('scroll-reveal--text')) {
        s.classList.add('scroll-reveal--text');
      }
    });

    // 2. Paragraphs & Body Copy
    const paragraphs = document.querySelectorAll(
      '.about__body-copy p, .services-clean__desc, .skills-panel__subtext, .process__subtitle, .pcontact-desc, .thank-you__tagline, .thank-you__role, .about-hero__intro'
    );
    paragraphs.forEach(p => {
      if (!p.classList.contains('scroll-reveal--text')) {
        p.classList.add('scroll-reveal--text');
      }
    });

    // 3. Service Interactive Rows & Preview Card (with stagger delay)
    const serviceRows = document.querySelectorAll('.service-row');
    serviceRows.forEach((row, index) => {
      if (!row.classList.contains('scroll-reveal--card')) {
        row.classList.add('scroll-reveal--card');
        row.classList.add(`reveal-delay-${Math.min(index + 1, 6)}`);
      }
    });

    const servicePreviewCard = document.querySelector('.services-interactive__preview-card');
    if (servicePreviewCard && !servicePreviewCard.classList.contains('scroll-reveal--card')) {
      servicePreviewCard.classList.add('scroll-reveal--card');
    }

    // Legacy Service Cards (if any)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
      if (!card.classList.contains('scroll-reveal--card')) {
        card.classList.add('scroll-reveal--card');
        card.classList.add(`reveal-delay-${Math.min(index + 1, 6)}`);
      }
    });

    // 4. Additional Skill Items (with stagger delay)
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
      if (!item.classList.contains('scroll-reveal--card')) {
        item.classList.add('scroll-reveal--card');
        item.classList.add(`reveal-delay-${Math.min(index + 1, 6)}`);
      }
    });

    // 5. Portfolio Section Nav & Container
    const portfolioNav = document.querySelector('.portfolio__nav');
    if (portfolioNav && !portfolioNav.classList.contains('scroll-reveal--text')) {
      portfolioNav.classList.add('scroll-reveal--text');
    }

    const portfolioSliders = document.querySelectorAll('.portfolio__active');
    portfolioSliders.forEach(slider => {
      if (!slider.classList.contains('scroll-reveal--img')) {
        slider.classList.add('scroll-reveal--img');
      }
    });

    // 6. Contact Section Panels & Features
    const contactLeft = document.querySelector('.pcontact-left-col');
    if (contactLeft && !contactLeft.classList.contains('scroll-reveal--card')) {
      contactLeft.classList.add('scroll-reveal--card');
    }

    const contactForm = document.querySelector('.pcontact-form');
    if (contactForm && !contactForm.classList.contains('scroll-reveal--card')) {
      contactForm.classList.add('scroll-reveal--card');
      contactForm.classList.add('reveal-delay-2');
    }

    const contactFeatures = document.querySelectorAll('.pcontact-feature-item');
    contactFeatures.forEach((feat, index) => {
      if (!feat.classList.contains('scroll-reveal--card')) {
        feat.classList.add('scroll-reveal--card');
        feat.classList.add(`reveal-delay-${Math.min(index + 1, 4)}`);
      }
    });

    // 7. Thank You Closing Section
    const thankYouContent = document.querySelector('.thank-you__content');
    if (thankYouContent && !thankYouContent.classList.contains('scroll-reveal--card')) {
      thankYouContent.classList.add('scroll-reveal--card');
    }

    const thankYouRobot = document.querySelector('.thank-you__robot-wrapper');
    if (thankYouRobot && !thankYouRobot.classList.contains('scroll-reveal--img')) {
      thankYouRobot.classList.add('scroll-reveal--img');
      thankYouRobot.classList.add('reveal-delay-2');
    }

    // 8. About Section Elements (Orbit & Action buttons)
    const aboutOrbit = document.querySelector('.about__orbit-wrapper');
    if (aboutOrbit && !aboutOrbit.classList.contains('scroll-reveal--card')) {
      aboutOrbit.classList.add('scroll-reveal--card');
    }

    const aboutActions = document.querySelector('.about__actions');
    if (aboutActions && !aboutActions.classList.contains('scroll-reveal--card')) {
      aboutActions.classList.add('scroll-reveal--card');
      aboutActions.classList.add('reveal-delay-2');
    }

    // 9. Service Card Mockups (Subtle image reveal)
    const serviceMockups = document.querySelectorAll('.service-card__mockup');
    serviceMockups.forEach(m => {
      if (!m.classList.contains('scroll-reveal--img')) {
        m.classList.add('scroll-reveal--img');
      }
    });

    // 10. Graphic Showcase & AI Video Cards (staggered)
    const gdCards = document.querySelectorAll('.gd-card');
    gdCards.forEach((card, index) => {
      if (!card.classList.contains('scroll-reveal--card')) {
        card.classList.add('scroll-reveal--card');
        card.classList.add(`reveal-delay-${Math.min((index % 4) + 1, 4)}`);
      }
    });

    const aivCards = document.querySelectorAll('.aiv-card');
    aivCards.forEach((card, index) => {
      if (!card.classList.contains('scroll-reveal--card')) {
        card.classList.add('scroll-reveal--card');
        card.classList.add(`reveal-delay-${Math.min((index % 3) + 1, 4)}`);
      }
    });

    // 11. About Page Specific: Certifications & Tabs
    const certTabs = document.querySelector('.cert-nav-tabs');
    if (certTabs && !certTabs.classList.contains('scroll-reveal--text')) {
      certTabs.classList.add('scroll-reveal--text');
    }

    const certCards = document.querySelectorAll('.cert-card');
    certCards.forEach((card, index) => {
      if (!card.classList.contains('scroll-reveal--card')) {
        card.classList.add('scroll-reveal--card');
        card.classList.add(`reveal-delay-${Math.min((index % 3) + 1, 4)}`);
      }
    });

    // 12. Experience & Education items on About page
    const resumeItems = document.querySelectorAll('.experience__item, .education__item');
    resumeItems.forEach((item, index) => {
      if (!item.classList.contains('scroll-reveal--card')) {
        item.classList.add('scroll-reveal--card');
        item.classList.add(`reveal-delay-${Math.min((index % 3) + 1, 3)}`);
      }
    });
    // 13. Experience Cards on About page
    const expCards = document.querySelectorAll('.exp-card');
    expCards.forEach((card, index) => {
      if (!card.classList.contains('scroll-reveal--card')) {
        card.classList.add('scroll-reveal--card');
        card.classList.add(`reveal-delay-${Math.min(index + 1, 4)}`);
      }
    });
  }

  // Handle Bootstrap tab switching so newly visible tab panes reveal smoothly
  function initTabSwitchReveals() {
    document.addEventListener('shown.bs.tab', function (e) {
      const targetSelector = e.target.getAttribute('data-bs-target') || e.target.getAttribute('href');
      if (targetSelector) {
        const pane = document.querySelector(targetSelector);
        if (pane) {
          pane.querySelectorAll('.scroll-reveal, .scroll-reveal--heading, .scroll-reveal--text, .scroll-reveal--card, .scroll-reveal--img').forEach(el => {
            el.classList.add('is-revealed');
          });
        }
      }
    });
  }

  /* ==========================================================================
     6. Initialization
     ========================================================================== */

  function init() {
    initSmoothAnchorNavigation();
    initScrollSpy();
    initScrollReveals();
    initTabSwitchReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
