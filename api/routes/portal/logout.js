export default function (app) {
  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect(`https://mcastaging.b2clogin.com/mcastaging.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/portal/start`);
    });
  });
}
