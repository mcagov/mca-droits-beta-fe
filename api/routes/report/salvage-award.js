const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.post(
    '/report/salvage-award-answer',
    [
      body('claim-salvage')
        .exists()
        .notEmpty()
        .withMessage('Select yes if you wish to claim a salvage award')
    ],
    async function (req, res) {
      req.session.data['claim-salvage'] = req.body['claim-salvage'];

      if (req.body['claim-salvage'] === 'yes') {
        req.session.data['salvage-services'] = req.body['salvage-services'];
        await body('salvage-services')
          .exists()
          .escape()
          .not()
          .isEmpty()
          .withMessage('Describe the services rendered')
          .run(req);
      }
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
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
