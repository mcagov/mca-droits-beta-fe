const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/check-your-answers',
    [
      body('property-declaration')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select to confirm you are happy with the declaration')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));

      req.session.data.redirectToCheckAnswers = null;

      if (errors) {
        return res.render('report/check-your-answers', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      } else {
        // Final data to post to server
        const data = JSON.stringify(req.session.data);

        res.redirect('/report/confirmation');
      }
    }
  );
}
