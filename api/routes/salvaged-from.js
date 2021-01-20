const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/salvaged-from',
    [
      body('removed-from')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Please choose an option')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      if (errors) {
        return res.render('report/salvaged-from', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
      
      res.render('report/location');
    }
  );
}
