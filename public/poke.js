/**
 * Poke Embed Script - Assembly Studio Minimalist Target Selector Widget
 * Pure vanilla JavaScript. Zero dependencies.
 */
(function () {
  if (window.__POKE_INITIALIZED__) return;
  window.__POKE_INITIALIZED__ = true;

  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var projectId = currentScript ? currentScript.getAttribute('data-project-id') : null;
  var apiHost = currentScript ? (currentScript.getAttribute('data-api-host') || '') : '';
  
  if (!apiHost && currentScript && currentScript.src) {
    try {
      var url = new URL(currentScript.src);
      apiHost = url.origin;
    } catch (e) {
      apiHost = window.location.origin;
    }
  }

  var targetElementData = null;
  var isTargeting = false;
  var hoverOverlay = null;

  function createWidgetUI() {
    // Floating Launcher Button
    var launcher = document.createElement('button');
    launcher.id = 'poke-widget-launcher';
    launcher.setAttribute('aria-label', 'Give feedback or report bug');
    launcher.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v4"></path>
        <path d="M12 16h.01"></path>
      </svg>
      <span>Poke</span>
    `;

    var style = document.createElement('style');
    style.id = 'poke-widget-styles';
    style.textContent = `
      #poke-widget-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999990;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: #09090b;
        color: #ffffff;
        border: 1px solid #18181b;
        border-radius: 9999px;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        transition: all 0.15s ease-in-out;
      }
      #poke-widget-launcher:hover {
        transform: translateY(-2px);
        background: #18181b;
        box-shadow: 0 14px 30px -5px rgba(0, 0, 0, 0.3);
      }
      #poke-widget-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 999995;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #poke-widget-modal-overlay.poke-open {
        display: flex;
      }
      .poke-modal-card {
        background: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 24px;
        width: 100%;
        max-width: 420px;
        padding: 24px;
        color: #09090b;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        box-sizing: border-box;
      }
      .poke-modal-card * {
        box-sizing: border-box;
      }
      .poke-target-overlay-box {
        position: fixed;
        pointer-events: none;
        z-index: 999998;
        border: 2px dashed #09090b;
        background: rgba(9, 9, 11, 0.08);
        border-radius: 6px;
        transition: all 0.05s ease;
      }
      .poke-target-tooltip {
        position: absolute;
        top: -28px;
        left: 0;
        background: #09090b;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 9999px;
        white-space: nowrap;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(launcher);

    var modalOverlay = document.createElement('div');
    modalOverlay.id = 'poke-widget-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="poke-modal-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #09090b;"></div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #09090b;">Send Feedback</h3>
          </div>
          <button id="poke-modal-close" style="background: #f4f4f5; border: none; color: #71717a; cursor: pointer; font-size: 16px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 16px; background: #f4f4f5; padding: 4px; border-radius: 9999px;">
          <button class="poke-type-btn poke-active" data-type="BUG" style="flex: 1; padding: 7px; border: none; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; background: #09090b; color: #ffffff;">Bug</button>
          <button class="poke-type-btn" data-type="FEATURE" style="flex: 1; padding: 7px; border: none; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; background: transparent; color: #71717a;">Feature</button>
          <button class="poke-type-btn" data-type="GENERAL" style="flex: 1; padding: 7px; border: none; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; background: transparent; color: #71717a;">General</button>
        </div>

        <div style="margin-bottom: 14px;">
          <button id="poke-target-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: #f4f4f5; border: 1px dashed #d4d4d8; border-radius: 12px; color: #09090b; font-size: 13px; font-weight: 700; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
            <span id="poke-target-label">Poke an Element on Page</span>
          </button>
          <div id="poke-target-badge" style="display: none; margin-top: 8px; padding: 6px 12px; background: #f4f4f5; border-radius: 8px; font-size: 12px; color: #09090b; font-family: monospace; justify-content: space-between; align-items: center;">
            <span id="poke-target-text-preview" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px;"></span>
            <button id="poke-target-clear" style="background: transparent; border: none; color: #ef4444; cursor: pointer; margin-left: 8px; font-weight: bold;">✕</button>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <textarea id="poke-message-input" rows="4" placeholder="Describe the issue or suggestion..." style="width: 100%; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; padding: 12px; color: #09090b; font-size: 13px; outline: none; resize: vertical;"></textarea>
        </div>

        <div style="margin-bottom: 18px;">
          <input id="poke-email-input" type="email" placeholder="Your email (optional)" style="width: 100%; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 10px 12px; color: #09090b; font-size: 13px; outline: none;" />
        </div>

        <button id="poke-submit-btn" style="width: 100%; padding: 12px; background: #09090b; border: none; border-radius: 9999px; color: #ffffff; font-weight: 700; font-size: 13px; cursor: pointer;">
          Send Feedback
        </button>

        <div id="poke-status-msg" style="display: none; margin-top: 12px; font-size: 13px; text-align: center;"></div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    var selectedType = 'BUG';

    launcher.addEventListener('click', function () {
      modalOverlay.classList.add('poke-open');
    });

    document.getElementById('poke-modal-close').addEventListener('click', function () {
      modalOverlay.classList.remove('poke-open');
    });

    var typeBtns = modalOverlay.querySelectorAll('.poke-type-btn');
    typeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        typeBtns.forEach(function (b) {
          b.style.background = 'transparent';
          b.style.color = '#71717a';
          b.classList.remove('poke-active');
        });
        btn.style.background = '#09090b';
        btn.style.color = '#ffffff';
        btn.classList.add('poke-active');
        selectedType = btn.getAttribute('data-type');
      });
    });

    var targetBtn = document.getElementById('poke-target-btn');
    targetBtn.addEventListener('click', function () {
      modalOverlay.classList.remove('poke-open');
      startElementSelectorMode();
    });

    document.getElementById('poke-target-clear').addEventListener('click', function () {
      targetElementData = null;
      var badge = document.getElementById('poke-target-badge');
      badge.style.display = 'none';
      document.getElementById('poke-target-label').textContent = 'Poke an Element on Page';
    });

    document.getElementById('poke-submit-btn').addEventListener('click', function () {
      var message = document.getElementById('poke-message-input').value.trim();
      var email = document.getElementById('poke-email-input').value.trim();
      var statusMsg = document.getElementById('poke-status-msg');

      if (!message) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = 'Please provide a message before sending.';
        return;
      }

      var submitBtn = document.getElementById('poke-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var payload = {
        projectId: projectId || 'proj_demo_assembly',
        type: selectedType,
        message: message,
        userEmail: email || null,
        pageUrl: window.location.href,
        browser: parseBrowserName(),
        os: parseOSName(),
        deviceType: window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'),
        screenResolution: window.screen.width + ' x ' + window.screen.height,
        referrer: document.referrer || null,
        elementSelector: targetElementData ? targetElementData.selector : null,
        elementTag: targetElementData ? targetElementData.tag : null,
        elementText: targetElementData ? targetElementData.text : null
      };

      fetch((apiHost || '') + '/api/v1/poke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
        if (data.success || data.id) {
          statusMsg.style.display = 'block';
          statusMsg.style.color = '#16a34a';
          statusMsg.textContent = '✓ Feedback sent successfully!';
          document.getElementById('poke-message-input').value = '';
          targetElementData = null;
          document.getElementById('poke-target-badge').style.display = 'none';
          document.getElementById('poke-target-label').textContent = 'Poke an Element on Page';
          setTimeout(function () {
            modalOverlay.classList.remove('poke-open');
            statusMsg.style.display = 'none';
          }, 1800);
        } else {
          statusMsg.style.display = 'block';
          statusMsg.style.color = '#ef4444';
          statusMsg.textContent = data.error || 'Failed to submit feedback.';
        }
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444';
        statusMsg.textContent = 'Network error. Please try again.';
      });
    });
  }

  function startElementSelectorMode() {
    if (isTargeting) return;
    isTargeting = true;

    hoverOverlay = document.createElement('div');
    hoverOverlay.className = 'poke-target-overlay-box';
    var tooltip = document.createElement('div');
    tooltip.className = 'poke-target-tooltip';
    tooltip.textContent = 'Click to Poke this element';
    hoverOverlay.appendChild(tooltip);
    document.body.appendChild(hoverOverlay);

    function onMouseMove(e) {
      if (!isTargeting) return;
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest('#poke-widget-modal-overlay') || el.closest('#poke-widget-launcher')) return;

      var rect = el.getBoundingClientRect();
      hoverOverlay.style.top = rect.top + window.scrollY + 'px';
      hoverOverlay.style.left = rect.left + window.scrollX + 'px';
      hoverOverlay.style.width = rect.width + 'px';
      hoverOverlay.style.height = rect.height + 'px';
      hoverOverlay.style.display = 'block';
    }

    function onClick(e) {
      if (!isTargeting) return;
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest('#poke-widget-modal-overlay') || el.closest('#poke-widget-launcher')) return;

      e.preventDefault();
      e.stopPropagation();

      var selector = getCssSelector(el);
      var tag = el.tagName;
      var text = (el.innerText || el.textContent || '').trim().substring(0, 100);

      targetElementData = {
        selector: selector,
        tag: tag,
        text: text
      };

      stopElementSelectorMode();

      var badge = document.getElementById('poke-target-badge');
      var preview = document.getElementById('poke-target-text-preview');
      preview.textContent = '<' + tag.toLowerCase() + '> ' + (text ? '"' + text + '"' : selector);
      badge.style.display = 'flex';
      document.getElementById('poke-target-label').textContent = 'Element Selected!';

      var modalOverlay = document.getElementById('poke-widget-modal-overlay');
      modalOverlay.classList.add('poke-open');
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        stopElementSelectorMode();
        var modalOverlay = document.getElementById('poke-widget-modal-overlay');
        modalOverlay.classList.add('poke-open');
      }
    }

    function stopElementSelectorMode() {
      isTargeting = false;
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      if (hoverOverlay && hoverOverlay.parentNode) {
        hoverOverlay.parentNode.removeChild(hoverOverlay);
      }
    }

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
  }

  function getCssSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      var classes = el.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      if (classes) return el.tagName.toLowerCase() + '.' + classes;
    }
    return el.tagName.toLowerCase();
  }

  function parseBrowserName() {
    var ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Browser';
  }

  function parseOSName() {
    var ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'OS';
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createWidgetUI();
  } else {
    document.addEventListener('DOMContentLoaded', createWidgetUI);
  }

  window.Poke = {
    init: function (opts) {
      if (opts && opts.projectId) projectId = opts.projectId;
      if (opts && opts.apiHost) apiHost = opts.apiHost;
    },
    open: function () {
      var modal = document.getElementById('poke-widget-modal-overlay');
      if (modal) modal.classList.add('poke-open');
    }
  };
})();
