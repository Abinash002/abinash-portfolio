/**
 * Smooth Parallax Contact & Footer Reveal Controller
 * Handles:
 * - Scroll-driven parallax depth for Contact Section (emerging from behind Main Content)
 * - Progressive curtain reveal for Dark Navy Footer (emerging from beneath Contact Section)
 * - 60fps/120fps requestAnimationFrame performance with reverse scroll support
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const mainArea = document.querySelector('.main-area');
    const contactSection = document.getElementById('contact');
    const contactInner = document.querySelector('.parallax-contact__inner');
    const footerSection = document.getElementById('footer');
    const footerInner = document.querySelector('.parallax-footer__inner');

    if (!contactSection || !footerSection) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    function updateParallax() {
      ticking = false;

      const viewportHeight = window.innerHeight;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // 1. Contact Section Parallax Reveal (from behind Main Area)
      if (contactSection && contactInner) {
        const contactRect = contactSection.getBoundingClientRect();
        
        // When contact section starts entering the viewport from the bottom
        if (contactRect.top < viewportHeight && contactRect.bottom > 0) {
          // Progress from 0 (just entering bottom) to 1 (top reached 0)
          const contactProgress = Math.min(
            Math.max((viewportHeight - contactRect.top) / (viewportHeight * 0.8), 0),
            1
          );

          // Subtle upward parallax shift (-50px -> 0px) for depth
          const contactOffsetY = (1 - contactProgress) * -50;
          contactInner.style.transform = `translate3d(0, ${contactOffsetY}px, 0)`;
        } else if (contactRect.top >= viewportHeight) {
          contactInner.style.transform = 'translate3d(0, -50px, 0)';
        } else {
          contactInner.style.transform = 'translate3d(0, 0, 0)';
        }
      }

      // 2. Footer Section Parallax Reveal (from beneath Contact Section)
      if (footerSection && footerInner) {
        const footerRect = footerSection.getBoundingClientRect();

        // When footer is being revealed as contact scrolls up
        if (footerRect.top < viewportHeight && footerRect.bottom > 0) {
          const footerProgress = Math.min(
            Math.max((viewportHeight - footerRect.top) / footerSection.offsetHeight, 0),
            1
          );

          // Subtle parallax shift for footer content (-30px -> 0px)
          const footerOffsetY = (1 - footerProgress) * -30;
          footerInner.style.transform = `translate3d(0, ${footerOffsetY}px, 0)`;
        } else {
          footerInner.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial update
    updateParallax();
  });
})();
