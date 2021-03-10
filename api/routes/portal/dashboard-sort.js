// Converts the date so it can be sorted
const reverseDate = (date) => {
  let parts = date.split(' ');
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

export default function (app) {
  app.post(
    '/portal/dashboard-sort',

    function (req, res) {
      const type = req.body['report-sort-by'];

      req.session.data['report-sort-by'] = type;

      req.session.data.userReports.sort((a, b) => {
        (a = reverseDate(a[type])), (b = reverseDate(b[type]));
        return b - a;
      });

      res.redirect('dashboard');
    }
  );
}
