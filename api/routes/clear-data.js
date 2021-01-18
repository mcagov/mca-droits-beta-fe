export default function (app) {
  app.get('/', function (req, res, next) {
    req.session.data = {};
    res.render('index.html');
  });
}
