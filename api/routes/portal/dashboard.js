import adal from 'adal-node';
import axios from 'axios';
import dayjs from 'dayjs';

export default function (app) {
  app.post('/portal/dashboard', function (req, res) {
    const adalAuthContext = adal.AuthenticationContext;
    const authorityHostUrl = 'https://login.microsoftonline.com';
    const tenant = '513fb495-9a90-425b-a49a-bc6ebe2a429e';
    const authorityUrl = authorityHostUrl + '/' + tenant;
    const clientId = '62ef4f36-0bd1-43f0-9ce4-eaf4a078b9a1';
    const clientSecret = 'H9Z5g5N0VN~AV2.g~n1UP_8Wn9l.-0u2N_';
    const resource = 'https://mca-sandbox.crm11.dynamics.com';
    const url =
      'https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports?$select=crf99_reportreference,crf99_datereported,crf99_datefound,modifiedon,_crf99_reporter_value';
    req.session.data = {};
    let session = req.session.data;
    // Contains 2 test reports, with a third added from the api response:
    session.userReports = [
      {
        'report-ref': '98/21',
        'date-found': '28 12 2019',
        'date-reported': '15 01 2020',
        'last-updated': '05 03 2021',
      },
      {
        'report-ref': '99/21',
        'date-found': '17 01 2020',
        'date-reported': '23 02 2020',
        'last-updated': '01 02 2021',
      },
    ];

    const context = new adalAuthContext(authorityUrl);

    context.acquireTokenWithClientCredentials(
      resource,
      clientId,
      clientSecret,
      (err, tokenResponse) => {
        if (err) {
          console.log(`Token generation failed due to ${err}`);
        } else {
          const accessToken = tokenResponse.accessToken;
          fetchData(accessToken).then(() => {
            return res.redirect('/portal/dashboard');
          });
        }
      }
    );

    function fetchData(accessToken) {
      return new Promise((resolve, reject) => {
        axios
          .get(url, {
            headers: { Authorization: `bearer ${accessToken}` },
          })
          .then((res) => {
            // For testing purposes we are hard coding a userID here, but the aim is to use the
            // inputted email address to query 'contacts' and grab the userID, before querying
            // 'mcawreckreports' to retrieve the wreck data related to that userID.
            // The obj key for user ids is _crf99_reporter_value

            // Assume we have retrieved this from the 'contacts' table in the database
            const currentUserID = '8da6141c-727b-eb11-a812-0022481a85d1';
            const data = res.data.value;

            data.find(function (item, index) {
              if (item._crf99_reporter_value === currentUserID) {
                formatReportData(item);
              }
            });
            resolve();
          })
          .catch((reqError) => {
            return reqError;
          });
      });
    }

    function formatReportData(data) {
      let reportItem = {};

      reportItem['report-ref'] = data.crf99_reportreference;
      reportItem['date-found'] = dayjs(data.crf99_datefound).format(
        'DD MM YYYY'
      );
      reportItem['date-reported'] = dayjs(data.crf99_datereported).format(
        'DD MM YYYY'
      );
      reportItem['last-updated'] = dayjs(data.modifiedon).format('DD MM YYYY');

      session.userReports.push(reportItem);
    }
  });
}
