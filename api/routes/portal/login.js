const msal = require('@azure/msal-node');
const dotenv = require('dotenv');
dotenv.config();

const config = {
  auth: {
    clientId: 'd6782c10-8404-477b-97ea-889da33828f9',
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: 'C_RLV2~sK4AFu_5o9~.eJ7d5PQSwaFE1r.',
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};
const REDIRECT_URI = "http://localhost:3000/portal/dashboard'";

// Create msal application object
const pca = new msal.ConfidentialClientApplication(config);

export default function (app) {
  app.get('/portal/login', function (req, res) {
    const authCodeUrlParameters = {
      scopes: ['user.read'],
      redirectUri: REDIRECT_URI,
    };

    // get url to sign user in and consent to scopes needed for application
    pca
      .getAuthCodeUrl(authCodeUrlParameters)
      .then((response) => {
        res.redirect(response);
      })
      .catch((error) => console.log(JSON.stringify(error)));
  });
  app.get('/portal/dashboard', (req, res) => {
    const tokenRequest = {
      code: req.query.code,
      scopes: ['user.read'],
      redirectUri: REDIRECT_URI,
    };

    pca
      .acquireTokenByCode(tokenRequest)
      .then((response) => {
        console.log('\nResponse: \n:', response);
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  });
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
