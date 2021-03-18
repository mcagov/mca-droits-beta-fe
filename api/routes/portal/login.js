import adal from 'adal-node';
const dotenv = require('dotenv');
dotenv.config();

export default function (app) {
  app.post('/portal/login', function (req, res) {
    const adalAuthContext = adal.AuthenticationContext;
    const authorityHostUrl = 'https://login.microsoftonline.com/';
    const tenant = process.env.TENANT_ID;
    const authorityUrl = authorityHostUrl + tenant;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const resource = process.env.DATAVERSE_API_BASE_URL;
    const context = new adalAuthContext(authorityUrl);

    const currentUserEmail = req.body.email;

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
          return res.redirect('dashboard');
        }
      }
    );
  });
}