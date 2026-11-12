/**
 * Contact Form Controller
 * Seamlessly sends contact messages via Gmail SMTP
 * Supports:
 * - Local Mail Server (PowerShell / Node on http://127.0.0.1:3001)
 * - Vercel / Netlify / Node (/api/sendmail)
 * - PHP Hosting (sendmail.php)
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const charCount = document.getElementById('contactCharCount');
    const submitBtn = form.querySelector('.pcontact-submit-btn');

    // Create or locate status banner
    let statusBanner = document.getElementById('contactFormStatus');
    if (!statusBanner) {
      statusBanner = document.createElement('div');
      statusBanner.id = 'contactFormStatus';
      statusBanner.className = 'pcontact-status-banner';
      statusBanner.style.display = 'none';
      form.parentNode.insertBefore(statusBanner, form);
    }

    // Cache original button content
    const originalBtnHtml = submitBtn.innerHTML;

    function setStatus(type, message) {
      statusBanner.className = `pcontact-status-banner ${type}`;
      statusBanner.style.display = 'flex';
      statusBanner.innerHTML = `
        <span style="font-size: 18px;">${type === 'success' ? '✓' : '⚠'}</span>
        <span>${message}</span>
      `;
      // Smooth scroll if needed
      statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearStatus() {
      statusBanner.style.display = 'none';
      statusBanner.innerHTML = '';
      statusBanner.className = 'pcontact-status-banner';
    }

    function setBtnLoading(isLoading) {
      if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="width: 1rem; height: 1rem; border-width: 2px;"></span>
          <span>SENDING...</span>
        `;
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }

    // Determine viable endpoints
    async function getEndpointCandidates() {
      const candidates = [];
      const origin = window.location.origin;
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // 1. Same-origin serverless / node endpoint
      candidates.push('/api/sendmail');
      candidates.push('sendmail.php');

      // 2. If running locally on VS Code Live Server or similar
      if (isLocal) {
        candidates.unshift('http://127.0.0.1:3001/api/sendmail');
      }

      return candidates;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearStatus();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        setStatus('error', 'Please fill in all required fields.');
        return;
      }

      setBtnLoading(true);

      const payload = { name, email, message };
      const endpoints = await getEndpointCandidates();
      let sent = false;
      let lastErrorMessage = '';

      for (const url of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            setStatus('success', data.message || `Thank you, ${name}! Your message has been sent successfully.`);
            form.reset();
            if (charCount) charCount.textContent = '0/500';
            sent = true;
            break;
          } else {
            const errData = await res.json().catch(() => ({}));
            lastErrorMessage = errData.message || `Server responded with status ${res.status}`;
          }
        } catch (err) {
          lastErrorMessage = err.message || 'Connection failed';
        }
      }

      if (!sent) {
        // Fallback for static hosts without backend running
        const mailtoUrl = `mailto:abinashfab098@gmail.com?subject=${encodeURIComponent('Portfolio Message from ' + name)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
        setStatus(
          'error',
          `Unable to reach the mail server. You can also send your message directly via email: <a href="${mailtoUrl}" style="color: #0062ff; text-decoration: underline; font-weight: 600; margin-left: 4px;">Click here to email Abinash</a>.`
        );
      }

      setBtnLoading(false);
    });
  });
})();
