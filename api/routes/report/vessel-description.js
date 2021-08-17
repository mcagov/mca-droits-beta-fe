const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.all('/report/vessel-description', function (req, res) {
    if (req.session.data['removed-from'] === 'shipwreck') {
      return res.render('report/vessel-description');
    }
    if (
      req.session.data['removed-from'] === 'seabed' &&
      req.session.data.redirectToCheckAnswers
    ) {
      return res.redirect('/report/check-your-answers');
    }

    return res.redirect('/report/property-summary');
  });

  app.post(
    '/report/vessel-description-answer',
    [
      body('wreck-description')
        .exists()
        .escape()
        .notEmpty()
        .withMessage('Enter a description')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        req.session.data['wreck-description'] = req.body['wreck-description'];
        return req.session.data.redirectToCheckAnswers
          ? res.redirect('/report/check-your-answers')
          : res.redirect('property-summary');
      } else {
        return res.render('report/vessel-description', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
