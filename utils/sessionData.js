import sessionDataDefaults from '../api/data/session-data-defaults';

export const sessionData = (req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  req.session.data = Object.assign(
    {},
    req.path.indexOf('report') > -1 && req.path.indexOf('portal') === -1
      ? sessionDataDefaults
      : null,
    req.session.data
  );

  // Send session data to all views

  res.locals.data = {};

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j];
  }

  next();
};
