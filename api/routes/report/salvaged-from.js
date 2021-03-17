const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

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

      if (
        req.body['removed-from'] === 'afloat' ||
        req.body['removed-from'] === 'sea shore'
      ) {
        req.session.data['vessel-depth'] = null;
        req.session.data['wreck-description'] = '';
      }
      if (req.body['removed-from'] === 'seabed') {
        req.session.data['wreck-description'] = '';
      }

      if (!errors) {
        req.session.data['removed-from'] = req.body['removed-from'];

        // Conditionals if user changes their mind about where they found the wreck
        // on check answers page
        if (
          req.session.data.redirectToCheckAnswers &&
          (req.body['removed-from'] === 'afloat' ||
            req.body['removed-from'] === 'sea shore')
        ) {
          return res.redirect('/report/check-your-answers');
        }

        if (req.session.data.redirectToCheckAnswers &&
          (req.body['removed-from'] === 'shipwreck' ||
            req.body['removed-from'] === 'seabed')
        ) {
          return res.redirect('/report/depth');
        }

        if (
          req.session.data.redirectToCheckAnswers &&
          req.session.data['vessel-depth'] === null
        ) {
          return res.redirect('/report/depth');
        }

        return res.redirect('location');
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
