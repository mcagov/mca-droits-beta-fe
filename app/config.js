// Use this file to change app configuration.

// Note: App config can be overridden using environment variables (eg on heroku)

module.exports = {
  // Service name used in header.
  SERVICE_NAME: 'Report Wreck Material',

  // Default port that app runs on
  PORT: '5000',

  // Force HTTP to redirect to HTTPS on production
  USE_HTTPS: 'false',

  // Cookie warning - update link to service's cookie page.
  COOKIE_TEXT:
    'GOV.UK uses cookies to make the site simpler. <a href="#">Find out more about cookies</a>',

  SERVICE_UNAVAILABLE: false
};
