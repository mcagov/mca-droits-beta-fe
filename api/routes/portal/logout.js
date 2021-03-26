export default function (app) {
  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect(
        'https://mcactitest.b2clogin.com/mcactitest.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_signin&post_logout_redirect_uri=http://localhost:3000'
      );
    });
  });
}
