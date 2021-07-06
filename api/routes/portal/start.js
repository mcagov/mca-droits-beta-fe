export default function (app) {
  app.get('/portal/start', function (req, res) {
    req.session.destroy(function (err) {
      res.render('portal/start');
    });
  });
}