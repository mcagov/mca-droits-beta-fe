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
        identityMetadata:
          'https://mcactitest.b2clogin.com/mcactitest.onmicrosoft.com/B2C_1_login/v2.0/.well-known/openid-configuration',
        clientID: 'e0019a41-2229-4597-b3fe-53bae1bd3433',
        responseType: 'code id_token',
        responseMode: 'form_post',
        redirectUrl: 'http://mca-d-web-1.azurewebsites.net/auth/openid/return',
        allowHttpForRedirectUrl: true,
        clientSecret: 'kl6CfT2WJcHI8RaW9u~f~a0GA_7K-kN-l-',
        validateIssuer: false,
        isB2C: true,
        validateIssuer: true,
        issuer: null,
        passReqToCallback: false,
        useCookieInsteadOfSession: false,
        cookieSameSite: false,
        loggingLevel: 'info',
        scope: 'e0019a41-2229-4597-b3fe-53bae1bd3433',
      },
      function (iss, sub, profile, accessToken, refreshToken, params, done) {
        if (!profile.oid) {
          return done(new Error('No oid found'), null);
        }
        // asynchronous verification, for effect...
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
      console.log("GET login");
      passport.authenticate('azuread-openidconnect', {
        response: res, // required
        failureRedirect: '/',
      })(req, res, next);
    },
    function (req, res) {
      log.info('We received a return from AzureAD.');
      res.render('portal/dashboard', { user: req.user });
    }
  );
}
