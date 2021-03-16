import axios from 'axios';
import dayjs from 'dayjs';

export default function (app) {
  app.get('/portal/dashboard', function (req, res) {
    const currentUserEmail = req.session.data.email;

    let accessToken = req.session.data.token;
    let currentUserID;

    const url = 'https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/';
    const contactsUrl = `${url}contacts?$filter=emailaddress1 eq '${currentUserEmail}'`;

    let userReports = [];

    getUserData(accessToken).then(() => {
      const filteredReportUrl = `${url}crf99_mcawreckreports?$filter=_crf99_reporter_value eq ${currentUserID}&$expand=crf99_MCAWreckMaterial_WreckReport_crf99_($select=crf99_description)`;
      fetchReportData(accessToken, filteredReportUrl).then(() => {
        return res.render('portal/dashboard', { userReports: userReports });
      });
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

    function fetchReportData(token, url) {
      return new Promise((resolve, reject) => {
        axios
          .get(url, {
            headers: { Authorization: `bearer ${token}` },
          })
          .then((res) => {
            const reportData = res.data.value;
            reportData.forEach((item) => {
              formatReportData(item);
            });
            resolve();
          })
          .catch((reqError) => {
            console.log('Report data error: ' + reqError);
            reject();
          });
      });
    }

    function formatReportData(data) {
      const wreckMaterialsData = data.crf99_MCAWreckMaterial_WreckReport_crf99_;

      let reportItem = {};

      reportItem['report-ref'] = data.crf99_reportreference;
      reportItem['date-found'] = dayjs(data.crf99_datefound).format(
        'DD MM YYYY'
      );
      reportItem['date-reported'] = dayjs(data.crf99_datereported).format(
        'DD MM YYYY'
      );
      reportItem['last-updated'] = dayjs(data.modifiedon).format('DD MM YYYY');
      reportItem['wreck-materials'] = [];

      wreckMaterialsData.forEach((item) => {
        reportItem['wreck-materials'].push(item.crf99_description);
      });

      userReports.push(reportItem);
    }
  });
}
