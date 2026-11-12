/**
 * Services Section - Interactive Two-Column Synchronization
 * Handles hover, click, keyboard navigation, and scroll-activated synchronization
 * between the interactive service rows and the dynamic preview panel.
 */

(function () {
  'use strict';

  function initServicesInteractive() {
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;

    const rows = Array.from(servicesSection.querySelectorAll('.service-row'));
    const panels = Array.from(servicesSection.querySelectorAll('.service-preview-panel'));
    const servicesList = servicesSection.querySelector('.services-list');

    if (!rows.length || !panels.length) return;

    let currentIndex = 0;
    let isHoveringList = false;
    let lastUserActionTime = 0;
    const ACTION_COOLDOWN_MS = 1500;

    // Check for pointer device (hover support)
    const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /**
     * Set active service by index
     * @param {number} targetIndex - 0-based index
     * @param {string} source - 'click' | 'hover' | 'scroll' | 'keyboard'
     */
    function setActiveService(targetIndex, source) {
      if (targetIndex < 0 || targetIndex >= rows.length) return;
      if (targetIndex === currentIndex && panels[targetIndex].classList.contains('is-active')) {
        return;
      }

      currentIndex = targetIndex;

      // Update right-column rows
      rows.forEach(function (row, idx) {
        const isActive = idx === targetIndex;
        row.classList.toggle('is-active', isActive);
        row.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) {
          row.setAttribute('tabindex', '0');
        } else {
          row.setAttribute('tabindex', '0');
        }
      });

      // Update left-column preview panels with animation replay
      panels.forEach(function (panel, idx) {
        if (idx === targetIndex) {
          panel.classList.remove('is-active');
          // Trigger reflow to restart CSS keyframe animations
          void panel.offsetWidth;
          panel.classList.add('is-active');
        } else {
          panel.classList.remove('is-active');
        }
      });

      if (source === 'click' || source === 'keyboard') {
        lastUserActionTime = Date.now();
      }
    }

    // Set initial active state (Service 01)
    setActiveService(0, 'init');

    // Attach row events: Hover, Click, Focus, and Keyboard
    rows.forEach(function (row, idx) {
      // Click interaction (desktop and mobile touch)
      row.addEventListener('click', function (e) {
        setActiveService(idx, 'click');
      });

      // Hover interaction (desktop only)
      if (canHover) {
        row.addEventListener('mouseenter', function () {
          setActiveService(idx, 'hover');
        });
      }

      // Keyboard accessibility (Enter, Space, Arrow keys)
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveService(idx, 'keyboard');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = (idx + 1) % rows.length;
          rows[nextIdx].focus();
          setActiveService(nextIdx, 'keyboard');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIdx = (idx - 1 + rows.length) % rows.length;
          rows[prevIdx].focus();
          setActiveService(prevIdx, 'keyboard');
        } else if (e.key === 'Home') {
          e.preventDefault();
          rows[0].focus();
          setActiveService(0, 'keyboard');
        } else if (e.key === 'End') {
          e.preventDefault();
          rows[rows.length - 1].focus();
          setActiveService(rows.length - 1, 'keyboard');
        }
      });
    });

    // Track when user is hovering inside the services list
    if (servicesList && canHover) {
      servicesList.addEventListener('mouseenter', function () {
        isHoveringList = true;
      });

      servicesList.addEventListener('mouseleave', function () {
        isHoveringList = false;
      });
    }

    // Scroll interaction: synchronize as user scrolls through services
    // Uses a throttled scroll listener or IntersectionObserver
    let scrollTimeout = null;

    function handleScrollSync() {
      // Don't override if user is hovering list or recently clicked
      if (isHoveringList) return;
      if (Date.now() - lastUserActionTime < ACTION_COOLDOWN_MS) return;

      const rect = servicesSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Only evaluate if services section is partially visible
      if (rect.bottom < 100 || rect.top > viewportHeight - 100) return;

      // On desktop where all rows fit in view at once, do not flip randomly
      // On mobile or smaller viewports where user scrolls down past rows, find closest to vertical center
      const centerY = viewportHeight * 0.45;
      let closestIdx = currentIndex;
      let minDistance = Infinity;

      rows.forEach(function (row, idx) {
        const rowRect = row.getBoundingClientRect();
        const rowCenter = rowRect.top + rowRect.height / 2;
        const distance = Math.abs(rowCenter - centerY);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      // Only switch if distance is reasonable
      if (minDistance < viewportHeight * 0.35 && closestIdx !== currentIndex) {
        setActiveService(closestIdx, 'scroll');
      }
    }

    window.addEventListener('scroll', function () {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(function () {
        scrollTimeout = null;
        handleScrollSync();
      }, 80);
    }, { passive: true });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicesInteractive);
  } else {
    initServicesInteractive();
  }
})();

