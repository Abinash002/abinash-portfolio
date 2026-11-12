/**
 * Graphic Design & AI Video Interactive Showcases
 * Handles:
 * - Smartwatch-style contained smooth scrolling & progress indicator
 * - Touch & drag-to-scroll support
 * - Viewer.js integration for Graphic Design images (no title, no navbar/post count)
 * - Hover zoom & video preview effects
 * - Full-screen Cinema Video Lightbox with Playback and Sound
 */

document.addEventListener('DOMContentLoaded', function () {
  /* ==========================================================================
     1. GRAPHIC DESIGN SHOWCASE (Viewer.js)
     ========================================================================== */
  const gdWrapper = document.getElementById('gdShowcaseWrapper');
  const gdViewport = document.getElementById('gdScrollViewport');
  const gdThumb = document.getElementById('gdScrollIndicatorThumb');
  const gdGrid = document.getElementById('gdGrid');
  const gdCards = Array.from(document.querySelectorAll('.gd-card'));

  let isGdDragging = false;
  let gdStartY = 0;
  let gdStartScrollTop = 0;
  let gdHasDragged = false;

  function updateGdScrollIndicator() {
    if (!gdViewport || !gdThumb) return;

    const scrollTop = gdViewport.scrollTop;
    const scrollHeight = gdViewport.scrollHeight;
    const clientHeight = gdViewport.clientHeight;

    if (scrollHeight <= clientHeight) {
      gdThumb.style.display = 'none';
      return;
    }

    gdThumb.style.display = 'block';
    const thumbHeightRatio = Math.max(clientHeight / scrollHeight, 0.15);
    const thumbHeightPercent = thumbHeightRatio * 100;
    const maxScroll = scrollHeight - clientHeight;
    const scrollPercent = (scrollTop / maxScroll) * (100 - thumbHeightPercent);

    gdThumb.style.height = `${thumbHeightPercent}%`;
    gdThumb.style.top = `${scrollPercent}%`;
  }

  if (gdViewport) {
    gdViewport.addEventListener('scroll', updateGdScrollIndicator, { passive: true });
    window.addEventListener('resize', updateGdScrollIndicator);

    // Drag-to-scroll for Graphic Design
    gdViewport.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isGdDragging = true;
      gdHasDragged = false;
      gdStartY = e.pageY - gdViewport.offsetTop;
      gdStartScrollTop = gdViewport.scrollTop;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isGdDragging || !gdViewport) return;
      const currentY = e.pageY - gdViewport.offsetTop;
      const walkY = (currentY - gdStartY) * 1.2;
      if (Math.abs(walkY) > 5) {
        gdHasDragged = true;
        gdViewport.scrollTop = gdStartScrollTop - walkY;
      }
    });

    window.addEventListener('mouseup', function () {
      isGdDragging = false;
      setTimeout(() => { gdHasDragged = false; }, 60);
    });
  }

  // Initialize Viewer.js on the Graphic Design gallery grid
  let gdViewer = null;
  if (gdGrid && typeof Viewer !== 'undefined') {
    gdViewer = new Viewer(gdGrid, {
      url: function (image) {
        return image.getAttribute('data-full') || image.src;
      },
      title: false,   // No post count, dimensions, or title
      navbar: false,  // No bottom thumbnail/post count bar as requested
      toolbar: {
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        prev: 1,
        play: 0,
        next: 1,
        rotateLeft: 1,
        rotateRight: 1,
        flipHorizontal: 1,
        flipVertical: 1,
      },
      button: true,     // Close 'X' button top right
      backdrop: true,   // Click backdrop to close
      transition: true,
      rotatable: true,
      scalable: true,
      zoomable: true,
      movable: true,
      tooltip: false,
    });
  }

  // Card click triggers Viewer.js
  gdCards.forEach((card, index) => {
    card.addEventListener('click', function () {
      if (gdHasDragged) return; // Prevent open if user was dragging
      if (gdViewer) {
        gdViewer.view(index);
      }
    });
  });

  const graphicTabBtn = document.getElementById('graphic-tab');
  if (graphicTabBtn) {
    graphicTabBtn.addEventListener('shown.bs.tab', function () {
      setTimeout(() => {
        updateGdScrollIndicator();
        if (gdViewer) gdViewer.update();
      }, 150);
    });
  }

  /* ==========================================================================
     2. AI VIDEOS SHOWCASE (Clickable Preview Cards -> Google Drive Links)
     ========================================================================== */
  const aivViewport = document.getElementById('aivScrollViewport');
  const aivThumb = document.getElementById('aivScrollIndicatorThumb');
  const aivCards = Array.from(document.querySelectorAll('.aiv-card'));

  let isAivDragging = false;
  let aivStartY = 0;
  let aivStartScrollTop = 0;
  let aivHasDragged = false;

  function updateAivScrollIndicator() {
    if (!aivViewport || !aivThumb) return;

    const scrollTop = aivViewport.scrollTop;
    const scrollHeight = aivViewport.scrollHeight;
    const clientHeight = aivViewport.clientHeight;

    if (scrollHeight <= clientHeight) {
      aivThumb.style.display = 'none';
      return;
    }

    aivThumb.style.display = 'block';
    const thumbHeightRatio = Math.max(clientHeight / scrollHeight, 0.15);
    const thumbHeightPercent = thumbHeightRatio * 100;
    const maxScroll = scrollHeight - clientHeight;
    const scrollPercent = (scrollTop / maxScroll) * (100 - thumbHeightPercent);

    aivThumb.style.height = `${thumbHeightPercent}%`;
    aivThumb.style.top = `${scrollPercent}%`;
  }

  if (aivViewport) {
    aivViewport.addEventListener('scroll', updateAivScrollIndicator, { passive: true });
    window.addEventListener('resize', updateAivScrollIndicator);

    // Drag-to-scroll for AI Videos viewport
    aivViewport.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isAivDragging = true;
      aivHasDragged = false;
      aivStartY = e.pageY - aivViewport.offsetTop;
      aivStartScrollTop = aivViewport.scrollTop;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isAivDragging || !aivViewport) return;
      const currentY = e.pageY - aivViewport.offsetTop;
      const walkY = (currentY - aivStartY) * 1.2;
      if (Math.abs(walkY) > 5) {
        aivHasDragged = true;
        aivViewport.scrollTop = aivStartScrollTop - walkY;
      }
    });

    window.addEventListener('mouseup', function () {
      isAivDragging = false;
      setTimeout(() => { aivHasDragged = false; }, 60);
    });
  }

  const aivTabBtn = document.getElementById('aivideos-tab');
  if (aivTabBtn) {
    aivTabBtn.addEventListener('shown.bs.tab', function () {
      setTimeout(updateAivScrollIndicator, 150);
    });
  }

  // Prevent accidental link navigation when dragging & disable native ghost drag
  aivCards.forEach(card => {
    card.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    card.addEventListener('click', function (e) {
      if (aivHasDragged) {
        e.preventDefault();
      }
    });
  });

  // Initial calculations
  setTimeout(() => {
    updateGdScrollIndicator();
    updateAivScrollIndicator();
  }, 350);
});
