import adal from 'adal-node';
const passport = require('passport');

export default function (app) {
  app
    .get(
      '/auth/openid/return',
      function (req, res, next) {
        passport.authenticate('azuread-openidconnect', {
          response: res,
          failureRedirect: '/report/start',
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
          failureRedirect: '/report/removed-property-check',
        })(req, res, next);
      },
      function (req, res) {
        const adalAuthContext = adal.AuthenticationContext;
        const authorityHostUrl = 'https://login.microsoftonline.com/';
        const tenant = process.env.TENANT_ID;
        const authorityUrl = authorityHostUrl + tenant;
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const resource = process.env.DATAVERSE_API_BASE_URL;
        const context = new adalAuthContext(authorityUrl);

        const currentUserEmail = req.user.emails[0];

        context.acquireTokenWithClientCredentials(
          resource,
          clientId,
          clientSecret,
          (err, tokenResponse) => {
            if (err) {
              console.log(`Token generation failed due to ${err}`);
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
