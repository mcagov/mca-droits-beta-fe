export const redirectToCheckDetails = (req, res, next) => {
  const referer = req.header('Referer');

  if (req.method === 'POST') {
    if (req.session.data && req.session.data.redirectToCheckAnswers) {
      req.session.data.redirectToCheckAnswers = null;
      res.redirect('/report/check-your-answers');
      return res.end();
    }
  }

  if (referer && referer.includes('/report/check-your-answers')) {
    req.session.data.redirectToCheckAnswers = true;
  } else if (req.session.data.redirectToCheckAnswers) {
    req.session.data.redirectToCheckAnswers = null;
  }

  return next();
};
