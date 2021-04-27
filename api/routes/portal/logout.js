export default function (app) {
  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect(`${process.env.B2C_BASE_URL}/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/portal/start`);
    });
  });
}
