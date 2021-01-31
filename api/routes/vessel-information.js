const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/vessel-information-answer',
    [
      body('wreck-name')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter the name of the vessel if known')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      
      if (!errors) {
        req.session.data['wreck-name'] = req.body['wreck-name'];
        res.render('report/salvaged-from');

      } else {
        return res.render('report/vessel-information', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
