const trusted = ["'self'"];
const helmet = require('helmet');

module.exports = function contentSecurityPolicy(nonce) {
   return helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: trusted,
         scriptSrc: [
            "'unsafe-eval'",
            "'unsafe-inline'",
            "'self'",
            '* data:',
            'blob:',
            'https://*.gstatic.com',
            `nonce-${nonce}`,
            'https://*.googleapis.com',
            '*.jquery.com',
            'https://*.mapbox.com',
            'https://cdnjs.cloudflare.com',
         ].concat(trusted),
         styleSrc: [
            "'unsafe-inline'",
            "'self'",
            'https://*.googleapis.com',
            'https://*.typography.com',
            'https://*.mapbox.com',
         ].concat(trusted),
         fontSrc: [
            'https://fonts.googleapis.com',
            '*.gstatic.com',
            "'self'",
            'data:',
         ].concat(trusted),
         imgSrc: [
            "'unsafe-eval'",
            "'unsafe-inline'",
            "'self'",
            'data:',
            'blob:',
            'https://*.mapbox.com',
         ].concat(trusted),
         connectSrc: [
            "'unsafe-inline'",
            'ws://localhost:*',
            'https://*.mapbox.com',
            `nonce-${nonce}`,
         ].concat(trusted),
         frameSrc: ['https://js.stripe.com/v3/', `nonce-${nonce}`].concat(
            trusted,
         ),
         scriptSrcAttr: [
            "'unsafe-eval'",
            "'unsafe-inline'",
            `nonce-${nonce}`,
         ].concat(trusted),
      },
      // set to true if you only want to report errors
      reportOnly: false,
      // set to true if you want to set all headers
      setAllHeaders: true,
      // set to true if you want to force buggy CSP in Safari 5
      safari5: false,
   });
};
