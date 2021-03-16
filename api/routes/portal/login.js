import adal from 'adal-node';

export default function (app) {
  app.post('/portal/login', function (req, res) {
    const adalAuthContext = adal.AuthenticationContext;
    const authorityHostUrl = 'https://login.microsoftonline.com';
    const tenant = '513fb495-9a90-425b-a49a-bc6ebe2a429e';
    const authorityUrl = authorityHostUrl + '/' + tenant;
    const clientId = '62ef4f36-0bd1-43f0-9ce4-eaf4a078b9a1';
    const clientSecret = 'H9Z5g5N0VN~AV2.g~n1UP_8Wn9l.-0u2N_';
    const resource = 'https://mca-sandbox.crm11.dynamics.com';
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