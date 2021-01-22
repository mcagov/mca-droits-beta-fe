const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/vessel-description',
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
        res.redirect('property-summary');

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
