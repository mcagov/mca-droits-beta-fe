import axios from 'axios';
import dayjs from 'dayjs';

export default function (app) {
  app.get(
    '/portal/report/:report',

    function (req, res) {
      let report = req.params.report;
      report = report.replace('-', '/');
      const token = req.session.data.token;

      const reportUrl = `https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports?$filter=crf99_reportreference eq '${report}'&$expand=crf99_MCAWreckMaterial_WreckReport_crf99_`;
      let reportData;

      fetchReportData(token, reportUrl).then(() => {
        console.log(reportData);
        res.render('portal/report', { reportData: reportData });
      });

      function fetchReportData(token, url) {
        return new Promise((resolve, reject) => {
          axios
            .get(url, {
              headers: { Authorization: `bearer ${token}` },
            })
            .then((res) => {
              reportData = res.data.value[0];
              reportData.coordinates = `${reportData.crf99_latitude}° ${reportData.crf99_longitude}°`;
              reportData.dateReported = dayjs(
                reportData.crf99_datereported
              ).format('DD MM YYYY');
              reportData.dateFound = dayjs(reportData.crf99_datefound).format(
                'DD MM YYYY'
              );
              resolve();
            })
            .catch((err) => {
              console.log('Report data error: ' + err);
              if (err.response.status === 401) {
                res.redirect('/portal/login');
              }
              reject();
            });
        });
      }
    }
  );
}
