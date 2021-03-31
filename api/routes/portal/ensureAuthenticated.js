export default function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.destroy(function (err) {
    req.logOut();
    res.redirect('/portal/start');
  });
}
