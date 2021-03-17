import sessionDataDefaults from '../api/data/session-data-defaults';

export const sessionData = (req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  req.session.data = Object.assign({}, sessionDataDefaults, req.session.data);

  // Send session data to all views

  res.locals.data = {};

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j];
  }

  next();
};
