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

      if (!errors) {
        req.session.data['vessel-depth'] = req.body['vessel-depth'];
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
