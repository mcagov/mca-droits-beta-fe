import adal from 'adal-node';
import axios from 'axios';
import dayjs from 'dayjs';
import ensureAuthenticated from './ensureAuthenticated';
const dotenv = require('dotenv');
dotenv.config();

const url =
  process.env.DATAVERSE_API_BASE_URL + process.env.DATAVERSE_API_SERVICE_URL;

export default function (app) {
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
          axios
            .get(contactsUrl, {
              headers: { Authorization: `bearer ${token}` },
            })
            .then((res) => {
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

  // Sorting reports
  // .post(
  //   '/portal/dashboard',

  //   function (req, res) {
  //     const type = req.body['report-sort-by'];
  //     const accessToken = req.session.data.token;
  //     const filteredReportUrl = `${url}crf99_mcawreckreports?$filter=_crf99_reporter_value eq ${req.session.data.id}&$expand=crf99_MCAWreckMaterial_WreckReport_crf99_($select=crf99_description)&$orderby=${type} desc`;
  //     const allReportsUrl = `${url}crf99_mcawreckreports?$expand=crf99_MCAWreckMaterial_WreckReport_crf99_($select=crf99_description)&$orderby=${type} desc`;
  //     let userReports = [];

  //     fetchReportData(accessToken, filteredReportUrl, userReports, res).then(
  //       () => {
  //         return res.render('portal/dashboard', {
  //           userReports: userReports,
  //           sort: type,
  //         });
  //       }
  //     );
  //   }
  // );
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
