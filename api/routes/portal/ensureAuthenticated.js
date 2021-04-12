export default function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.destroy(function (err) {
    req.logOut();
    res.redirect(`https://mcastaging.b2clogin.com/mcastaging.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/error`);
  });
}
