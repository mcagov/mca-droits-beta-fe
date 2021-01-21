const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/vessel-description',
    [
      body('vessel-description')
        .exists()
        .notEmpty()
        .withMessage('Please enter a description')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      if (errors) {
        return res.render('report/vessel-description', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }

      res.render('report/property-summary');
    }
  );
}
