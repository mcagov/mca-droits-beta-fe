const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.all('/report/depth', function (req, res) {
    // Get the answer from session data
    // The name between the quotes is the same as the 'name' attribute on the input elements
    // However in JavaScript we can't use hyphens in variable names

    const salvagedFrom = req.session.data['removed-from'];

    var depthResponses = ['shipwreck', 'seabed'];

    // If it's not one of the depth responses, skip this question.
    if (depthResponses.includes(salvagedFrom)) {
      res.render('report/depth');
    } else {
      res.redirect('/report/vessel-description');
    }
  });

  app.post(
    '/report/depth-answer',
    [
      body('vessel-depth')
        .exists()
        .notEmpty()
        .isDecimal()
        .withMessage('Please enter a number')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        req.session.data['vessel-depth'] = parseInt(req.body['vessel-depth']);
        if (
          req.session.data.redirectToCheckAnswers &&
          req.session.data['wreck-description'] !== ''
        ) {
          res.redirect('/report/check-your-answers');
        }
        res.redirect('vessel-description');
      } else {
        return res.render('report/depth', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
