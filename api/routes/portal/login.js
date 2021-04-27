const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'Microsoft OIDC Example Web Application',
});
export default function (app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user.oid);
  });

  passport.deserializeUser(function (oid, done) {
    findByOid(oid, function (err, user) {
      done(err, user);
    });
  });

  // array to hold logged in users
  var users = [];

  var findByOid = function (oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
      var user = users[i];
      log.info('we are using user: ', user);
      if (user.oid === oid) {
        return fn(null, user);
      }
    }
    return fn(null, null);
  };

  passport.use(
    new OIDCStrategy(
      {
        identityMetadata: process.env.B2C_BASE_URL + process.env.B2C_IDENTITY_METADATA,
        clientID: process.env.B2C_CLIENT_ID,
        responseType: 'code id_token',
        responseMode: 'form_post',
        redirectUrl: process.env.ENV_BASE_URL + process.env.B2C_REDIRECT_URL,
        allowHttpForRedirectUrl: true,
        clientSecret: process.env.B2C_CLIENT_SECRET,
        validateIssuer: false,
        isB2C: true,
        validateIssuer: true,
        issuer: null,
        passReqToCallback: false,
        useCookieInsteadOfSession: false,
        cookieSameSite: false,
        loggingLevel: 'info',
        scope: process.env.B2C_CLIENT_ID,
      },
      function (iss, sub, profile, accessToken, refreshToken, params, done) {
        if (!profile.oid) {
          return done(new Error('No oid found'), null);
        }
        // asynchronous verification
        process.nextTick(function () {
          findByOid(profile.oid, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              // "Auto-registration"
              users.push(profile);

              return done(null, profile);
            }
            return done(null, user);
          });
        });
      }
    )
  );

  app.get(
    '/login',
    function (req, res, next) {
      passport.authenticate('azuread-openidconnect', {
        response: res, // required
        failureRedirect: `${process.env.B2C_BASE_URL}/oauth2/v2.0/logout?p=B2C_1_login&post_logout_redirect_uri=${process.env.ENV_BASE_URL}/error`,
      })(req, res, next);
    },
    function (req, res) {
      log.info('We received a return from AzureAD.');
      res.render('portal/dashboard', { user: req.user });
    }
  );
}
