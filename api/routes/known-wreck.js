const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/known-wreck-answer',
    [
      body('known-wreck')
        .exists()
        .not()
        .isEmpty()
        .withMessage('You must choose an option')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      if (!errors) {
        req.session.data['known-wreck'] = req.body['known-wreck'];

        const value = req.session.data['known-wreck'];

        if (value === 'yes') {
          res.redirect('vessel-information');
        } else {
          res.redirect('salvaged-from');
        }
      } else {
        return res.render('report/removed-property-check', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
