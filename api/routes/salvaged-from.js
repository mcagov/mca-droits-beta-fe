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
        .withMessage('Please state where the wreck material was found')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        req.session.data['removed-from'] = req.body['removed-from'];
        res.redirect('location');
      } else {
        return res.render('report/salvaged-from', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
