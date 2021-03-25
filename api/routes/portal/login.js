const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

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
        redirectUrl: 'http://localhost:3000/portal/dashboard',
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
        scope: ['offline_access'],
      },
      function (iss, sub, profile, accessToken, refreshToken, done) {
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
              console.log(profile);

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
        failureRedirect: '/',
      })(req, res, next);
    },
    function (req, res) {
      log.info('We received a return from AzureAD.');
      res.render('dashboard', { user: req.user });
    }
  );

  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect(
        'https://mcactitest.b2clogin.com/mcactitest.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_signin&post_logout_redirect_uri=http://localhost:3000'
      );
    });
  });

  // app.get(
  //   '/portal/dashboard',
  //   function (req, res, next) {
  //     passport.authenticate('azuread-openidconnect', {
  //       response: res, // required
  //       failureRedirect: '/',
  //     })(req, res, next);
  //   },
  //   function (req, res) {
  //     log.info('We received a return from AzureAD.');
  //     res.redirect('/');
  //   }
  // );

  // app.post(
  //   '/portal/dashboard',
  //   function (req, res, next) {
  //     passport.authenticate('azuread-openidconnect', {
  //       response: res, // required
  //       failureRedirect: '/',
  //     })(req, res, next);
  //   },
  //   function (req, res) {
  //     log.info('We received a return from AzureAD.');
  //     res.redirect('/');
  //   }
  // );
}
// export default function (app) {
//   app.post('/portal/login', function (req, res) {
//     const adalAuthContext = adal.AuthenticationContext;
//     const authorityHostUrl = 'https://login.microsoftonline.com/';
//     const tenant = process.env.TENANT_ID;
//     const authorityUrl = authorityHostUrl + tenant;
//     const clientId = process.env.CLIENT_ID;
//     const clientSecret = process.env.CLIENT_SECRET;
//     const resource = process.env.DATAVERSE_API_BASE_URL;
//     const context = new adalAuthContext(authorityUrl);

//     const currentUserEmail = req.body.email;

//     context.acquireTokenWithClientCredentials(
//       resource,
//       clientId,
//       clientSecret,
//       (err, tokenResponse) => {
//         if (err) {
//           console.log(`Token generation failed due to ${err}`);
//         } else {
//           const accessToken = tokenResponse.accessToken;
//           req.session.data.token = accessToken;
//           req.session.data.email = currentUserEmail;
//           return res.redirect('dashboard');
//         }
//       }
//     );
//   });
// }
