import axios from 'axios';
import dayjs from 'dayjs';

export default function (app) {
  app.post(
    '/portal/dashboard',

    function (req, res) {
      const type = req.body['report-sort-by'];
      let userReports = [];
      console.log(type);

      const accessToken = req.session.data.token;
      const url = `https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports?$expand=crf99_MCAWreckMaterial_WreckReport_crf99_($select=crf99_description)&$orderby=${type} desc`;

      function fetchReportData(accessToken, url) {
        return new Promise((resolve, reject) => {
          axios
            .get(url, {
              headers: { Authorization: `bearer ${accessToken}` },
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

      fetchReportData(accessToken, url).then(() => {
        return res.render('portal/dashboard', {
          userReports: userReports,
          sort: type,
        });
      });

      function formatReportData(data) {
        const wreckMaterialsData =
          data.crf99_MCAWreckMaterial_WreckReport_crf99_;

        let reportItem = {};

        reportItem['report-ref'] = data.crf99_reportreference;
        reportItem['date-found'] = dayjs(data.crf99_datefound).format(
          'DD MM YYYY'
        );
        reportItem['date-reported'] = dayjs(data.crf99_datereported).format(
          'DD MM YYYY'
        );
        reportItem['last-updated'] = dayjs(data.modifiedon).format(
          'DD MM YYYY'
        );
        reportItem['wreck-materials'] = [];

        wreckMaterialsData.forEach((item) => {
          reportItem['wreck-materials'].push(item.crf99_description);
        });

        userReports.push(reportItem);
        console.log(userReports);
      }
    }
  );
}
