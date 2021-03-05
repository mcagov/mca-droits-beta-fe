// Redirect HTTP requests to HTTPS
export const forceHttps = function (req, res, next) {
  var protocol = req.headers['x-forwarded-proto'];
  // Glitch returns a comma separated list for x-forwarded-proto
  // We need the first to determine if running on https
  if (protocol) {
    protocol = protocol.split(',').shift();
  }

  if (protocol !== 'https') {
    console.log('Redirecting request to https');
    // 302 temporary - this is a feature that can be disabled
    return res.redirect(302, 'https://' + req.get('Host') + req.url);
  }

  // Mark proxy as secure (allows secure cookies)
  req.connection.proxySecure = true;
  next();
};
