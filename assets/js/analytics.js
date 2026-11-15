// Google Analytics 4 (property: Auto Glass Welly, stream https://autoglasswelly.co.nz)
//
// The tag only loads on the real domain. On the Vercel preview address
// (autoglassrepairwelly.vercel.app), localhost, or anywhere else, nothing is
// loaded or sent to Google, so test and preview visits are never recorded.
(function () {
  var MEASUREMENT_ID = 'G-524P80LM81';
  var HOSTS = ['autoglasswelly.co.nz', 'www.autoglasswelly.co.nz'];

  if (HOSTS.indexOf(location.hostname) === -1) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  // Key events. Mark these as key events in GA4 (Admin > Events):
  //   generate_lead - quote form sent (fires when Formspree lands on /thank-you)
  //   phone_call    - a tel: link was tapped
  //   email_click   - a mailto: link was clicked
  if (/^\/thank-you(\.html)?\/?$/.test(location.pathname)) {
    gtag('event', 'generate_lead', { form_name: 'quote_form' });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!link) return;
    var href = link.getAttribute('href');
    var isPhone = href.indexOf('tel:') === 0;
    gtag('event', isPhone ? 'phone_call' : 'email_click', {
      link_url: href,
      page_location: location.href,
      transport_type: 'beacon'
    });
  });
})();
