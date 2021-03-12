import axios from 'axios';

export default function (app) {
  app.get(
    '/portal/report/:report',

    function (req, res) {
      let report = req.params.report;
      report = report.replace('-', '/');
      const token = req.session.data.token;

      const reportUrl = `https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports?$filter=crf99_reportreference eq '${report}'`;
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
              console.log(res);
              reportData = res.data.value[0];
              console.log(reportData);

              resolve();
            })
            .catch((reqError) => {
              console.log('Report data error: ' + reqError);
              reject();
            });
        });
      }
    }
  );
}
