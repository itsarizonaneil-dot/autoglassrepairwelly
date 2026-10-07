// Business hours for the smart call button (NZ time). Set to null until the
// real hours are confirmed — the call button then stays live at all times.
// Example once known: { days: ['Mon','Tue','Wed','Thu','Fri'], opens: 8 * 60, closes: 17 * 60 }
var BUSINESS_HOURS = null;

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var icon = toggle.querySelector('i');
      var isOpen = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
      if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
    var closeNav = function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      var icon = toggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    };
    nav.querySelectorAll('a:not(.dropdown-toggle)').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    // Close the menu when tapping/clicking outside it
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });
  }

  // Services dropdown (tap to expand on mobile, hover on desktop)
  document.querySelectorAll('.has-dropdown > a.dropdown-toggle').forEach(function (link) {
    link.addEventListener('click', function (e) {
      // Desktop: hover opens the menu and a click goes to the Services page.
      // Phones: no hover, so a tap expands the menu (its first item links to /services).
      if (window.matchMedia('(max-width: 900px)').matches) {
        e.preventDefault();
        link.closest('.has-dropdown').classList.toggle('open');
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      item.closest('.faq-list, body').querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Point Formspree's post-submit redirect at the current origin's thank-you
  // page, so it works correctly on localhost/Vercel previews/production
  // alike instead of a hardcoded domain that may not match where the form
  // was actually submitted from
  document.querySelectorAll('input[name="_next"]').forEach(function (input) {
    input.value = window.location.origin + '/thank-you';
  });

  // Smart "Call" button — grey out and relabel every primary phone CTA
  // outside BUSINESS_HOURS (above), nudging visitors toward
  // the quote form instead. Uses Pacific/Auckland via Intl so it reflects
  // real NZ hours regardless of the visitor's own timezone/device clock,
  // and handles NZ daylight saving automatically.
  var callBtns = document.querySelectorAll('a.btn.btn-primary[href^="tel:"]');
  if (BUSINESS_HOURS && callBtns.length) {
    var callBtnState = new WeakMap();

    var isOpenNow = function () {
      var parts = new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(new Date());
      var weekday, hour, minute;
      parts.forEach(function (p) {
        if (p.type === 'weekday') weekday = p.value;
        if (p.type === 'hour') hour = parseInt(p.value, 10);
        if (p.type === 'minute') minute = parseInt(p.value, 10);
      });
      var isOpenDay = BUSINESS_HOURS.days.indexOf(weekday) !== -1;
      var minutesNow = (hour % 24) * 60 + minute;
      return isOpenDay && minutesNow >= BUSINESS_HOURS.opens && minutesNow < BUSINESS_HOURS.closes;
    };

    var applyCallBtnState = function () {
      var open = isOpenNow();
      callBtns.forEach(function (btn) {
        if (!callBtnState.has(btn)) {
          callBtnState.set(btn, { href: btn.getAttribute('href'), html: btn.innerHTML });
        }
        var original = callBtnState.get(btn);
        if (open) {
          btn.setAttribute('href', original.href);
          btn.removeAttribute('aria-disabled');
          btn.classList.remove('btn-closed');
          btn.innerHTML = original.html;
        } else {
          btn.removeAttribute('href');
          btn.setAttribute('aria-disabled', 'true');
          btn.classList.add('btn-closed');
          btn.innerHTML = '<i class="fa-solid fa-clock" aria-hidden="true"></i> We’re currently closed — leave your details and we’ll call you back';
        }
      });
    };

    applyCallBtnState();
    // Re-check periodically in case a visitor keeps the tab open across
    // the actual open/close transition.
    setInterval(applyCallBtnState, 5 * 60 * 1000);
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) header.style.boxShadow = '0 6px 20px rgba(7,47,87,0.08)';
      else header.style.boxShadow = 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});
