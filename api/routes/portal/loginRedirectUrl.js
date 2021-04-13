import adal from 'adal-node';
const passport = require('passport');

export default function (app) {
  app
    .get(
      '/auth/openid/return',
      function (req, res, next) {
        passport.authenticate('azuread-openidconnect', {
          response: res,
          failureRedirect: `${process.env.B2C_BASE_URL}/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/error`,
        })(req, res, next);
      },
      function (req, res) {
        res.redirect('/portal/dashboard');
      }
    )
    .post(
      '/auth/openid/return',
      function (req, res, next) {
        passport.authenticate('azuread-openidconnect', {
          response: res,
          failureRedirect: `${process.env.B2C_BASE_URL}/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/error`,
        })(req, res, next);
      },
      function (req, res) {
        const adalAuthContext = adal.AuthenticationContext;
        const authorityHostUrl = process.env.DATAVERSE_AUTHORITY_HOST_URL;
        const tenant = process.env.DATAVERSE_TENANT_ID;
        const authorityUrl = authorityHostUrl + tenant;
        const clientId = process.env.DATAVERSE_CLIENT_ID;
        const clientSecret = process.env.DATAVERSE_CLIENT_SECRET;
        const resource = process.env.DATAVERSE_BASE_URL;
        const context = new adalAuthContext(authorityUrl);

        const currentUserEmail = req.user.emails[0];

        context.acquireTokenWithClientCredentials(
          resource,
          clientId,
          clientSecret,
          (err, tokenResponse) => {
            if (err) {
              console.log(`Token generation failed due to ${err}`);
              req.logOut();
              res.redirect(`${process.env.B2C_BASE_URL}/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/error`);
            } else {
              const accessToken = tokenResponse.accessToken;
              req.session.data.token = accessToken;
              req.session.data.email = currentUserEmail;
              res.redirect('/portal/dashboard');
            }
          }
        );
      }
    );
}
