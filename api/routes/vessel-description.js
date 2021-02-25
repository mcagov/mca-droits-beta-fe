const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.all('/report/vessel-description', function (req, res) {
    // Get the answer from session data
    // The name between the quotes is the same as the 'name' attribute on the input elements
    // However in JavaScript we can't use hyphens in variable names

    const salvagedFrom = req.session.data['removed-from'];

    var descriptionResponses = ['shipwreck'];

    // If it's not one of the description responses, skip this question.
    if (descriptionResponses.includes(salvagedFrom)) {
      res.render('report/vessel-description');
    } else {
      res.redirect('/report/property-summary');
    }
  });

  app.post(
    '/report/vessel-description-answer',
    [
      body('wreck-description')
        .exists()
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
