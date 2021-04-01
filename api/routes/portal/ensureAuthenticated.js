export default function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.destroy(function (err) {
    req.logOut();
    res.redirect(`https://mcactitest.b2clogin.com/mcactitest.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_signin&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/error`);
  });
}
