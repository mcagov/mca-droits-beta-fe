const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.get('report/salvage-award', function (req, res) {
    return res.render('report/salvage-award');
  });

  app.post(
    '/report/salvage-award-answer',
    [
      body('claim-salvage')
        .exists()
        .notEmpty()
        .withMessage('Select yes if you wish to claim a salvage award')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        req.session.data['claim-salvage'] = req.body['claim-salvage'];
        if (req.body['salvage-services']) {
          req.session.data['salvage-services'] = req.body['salvage-services'];
        }
        req.session.data.redirectToCheckAnswers = true;
        res.redirect('check-your-answers');
      } else {
        return res.render('report/salvage-award', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
