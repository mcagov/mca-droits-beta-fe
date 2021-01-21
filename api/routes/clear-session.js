export default function (app) {
  app.get('/clear-session', function (req, res, next) {
    req.session.data = {};
    res.render('clear-session');
  });
}
