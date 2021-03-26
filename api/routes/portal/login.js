import adal from 'adal-node';
import axios from 'axios';
import dayjs from 'dayjs';

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
        redirectUrl: 'http://localhost:3000/auth/openid/return',
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
      passport.authenticate('azuread-openidconnect', {
        response: res, // required
        failureRedirect: '/',
      })(req, res, next);
    },
    function (req, res) {
      log.info('We received a return from AzureAD.');

      // res.render('portal/dashboard', { user: req.user });
    }
  );

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/portal/start');
  }

  app.get(
    '/auth/openid/return',
    function (req, res, next) {
      passport.authenticate('azuread-openidconnect', {
        response: res,
        failureRedirect: '/portal/start',
      })(req, res, next);
    },
    function (req, res) {
      res.redirect('/portal/dashboard');
    }
  );
  app.post(
    '/auth/openid/return',
    function (req, res, next) {
      passport.authenticate('azuread-openidconnect', {
        response: res,
        failureRedirect: '/portal/start',
      })(req, res, next);
    },
    function (req, res) {
      res.redirect('/portal/dashboard');
    }
  );

  app.get('/portal/dashboard', ensureAuthenticated, function (req, res) {
    const adalAuthContext = adal.AuthenticationContext;
    const authorityHostUrl = 'https://login.microsoftonline.com/';
    const tenant = process.env.TENANT_ID;
    const authorityUrl = authorityHostUrl + tenant;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const resource = process.env.DATAVERSE_API_BASE_URL;
    const context = new adalAuthContext(authorityUrl);

    const currentUserEmail = req.user.emails[0];

    return new Promise((resolve, reject) => {
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
            resolve();
            // return res.render('portal/dashboard');
          }
        }
      );
    }).then(() => {
      const url =
        process.env.DATAVERSE_API_BASE_URL +
        process.env.DATAVERSE_API_SERVICE_URL;
      const currentUserEmail = req.session.data.email;

      let accessToken = req.session.data.token;
      let currentUserID;
      let userReports = [];

      const contactsUrl = `${url}contacts?$filter=emailaddress1 eq '${req.user.emails[0]}'`;

      getUserData(accessToken).then(() => {
        const filteredReportUrl = `${url}crf99_mcawreckreports?$filter=_crf99_reporter_value eq ${currentUserID}&$expand=crf99_MCAWreckMaterial_WreckReport_crf99_($select=crf99_description)&$orderby=crf99_datereported desc`;
        // const allReportsUrl = `${url}crf99_mcawreckreports?$expand=crf99_MCAWreckMaterial_WreckReport_crf99_($select=crf99_description)&$orderby=crf99_datereported desc`;
        fetchReportData(accessToken, filteredReportUrl, userReports, res).then(
          () => {
            return res.render('portal/dashboard', { userReports: userReports });
          }
        );
      });

      function getUserData(token) {
        return new Promise((resolve, reject) => {
          console.log(contactsUrl, token);

          axios
            .get(contactsUrl, {
              headers: { Authorization: `bearer ${token}` },
            })
            .then((res) => {
              console.log('res.data', res.data.value[0]);

              const data = res.data.value[0];
              const session = req.session.data;
              currentUserID = data.contactid;
              session.id = currentUserID;
              session.userName = data.fullname;
              session.userEmail = data.emailaddress1;
              session.userTel = data.telephone1;
              session.userAddress1 = data.address1_line1;
              session.userCity = data.address1_city;
              session.userCounty = data.address1_county;
              session.userPostcode = data.address1_postalcode;
              resolve();
            })
            .catch((reqError) => {
              console.log('User ID error');
              console.log(reqError);
              reject();
            });
        });
      }
    });
  });

  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect(
        'https://mcactitest.b2clogin.com/mcactitest.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_signin&post_logout_redirect_uri=http://localhost:3000'
      );
    });
  });
}

const fetchReportData = (accessToken, url, userReports, res) =>
  new Promise((resolve, reject) => {
    axios
      .get(url, {
        headers: { Authorization: `bearer ${accessToken}` },
      })
      .then((res) => {
        const reportData = res.data.value;
        reportData.forEach((item) => {
          formatReportData(item, userReports);
        });
        resolve();
      })
      .catch((err) => {
        console.log('[Report data error]:' + err);
        if (err.response.status === 401) {
          res.redirect('/portal/login');
        }
        reject();
      });
  });

const formatReportData = (data, userReports) => {
  const wreckMaterialsData = data.crf99_MCAWreckMaterial_WreckReport_crf99_;

  let reportItem = {};

  reportItem['report-ref'] = data.crf99_reportreference;
  reportItem['date-found'] = dayjs(data.crf99_datefound).format('DD MM YYYY');
  reportItem['date-reported'] = dayjs(data.crf99_datereported).format(
    'DD MM YYYY'
  );
  reportItem['last-updated'] = dayjs(data.modifiedon).format('DD MM YYYY');
  reportItem['wreck-materials'] = [];

  wreckMaterialsData.forEach((item) => {
    reportItem['wreck-materials'].push(item.crf99_description);
  });

  userReports.push(reportItem);
  return userReports;
};
