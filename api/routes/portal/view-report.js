import axios from 'axios';

export default function (app) {
  app.get(
    '/portal/report/:report',

    function (req, res) {
      const report = req.params.report;
      const token = req.session.data.token;
      const reportUrl = `https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports?$filter=crf99_reportreference eq ${report}`;

      fetchReportData(token, reportUrl);

      function fetchReportData(token, url) {
        return new Promise((resolve, reject) => {
          axios
            .get(url, {
              headers: { Authorization: `bearer ${token}` },
            })
            .then((res) => {
              const reportData = res.data.value;
              console.log(reportData);

              resolve();
            })
            .catch((reqError) => {
              console.log('Report data error: ' + reqError);
              reject();
            });
        });
      }

      res.render('portal/report');
    }
  );
}
