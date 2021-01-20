const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/depth',
    [
      body('vessel-depth')
        .exists()
        .notEmpty()
        .isDecimal()
        .withMessage('Please enter a number')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      if (errors) {
        return res.render('report/depth', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }

      res.redirect('report/vessel-description');
    }
  );
}
