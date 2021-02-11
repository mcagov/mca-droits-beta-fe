const { body, validationResult } = require('express-validator');

import {
  formatValidationErrors,
  multiErrors,
  validationNumberCheck
} from '../../utils';

export default function (app) {
  app.post(
    '/report/find-date',
    [
      body('wreck-find-date-day')
        .exists()
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('Enter your find day'),
      body('wreck-find-date-month')
        .exists()
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('Enter your find month'),
      body('wreck-find-date-year')
        .exists()
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('Enter your find year')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      const session = req.session.data['wreck-find-date'];
      const body = req.body;

      // loop through default session data keys defined in /api/data/session-data-defaults.js
      for (let key in session) {
        session[key] = body[`wreck-find-date-${key}`];
      }

      if (!errors) {
        return res.render('report/personal');
      } else {
        const getErrors = multiErrors(
          errors,
          'wreck-find-date',
          'wreck-find-date',
          3,
          'Enter your find ',
          ' and ',
          'date '
        );

        const errorSummary = getErrors;

        validationNumberCheck(
          body['wreck-find-date-day'],
          errors['wreck-find-date']
        );
        validationNumberCheck(
          body['wreck-find-date-month'],
          errors['wreck-find-date']
        );
        validationNumberCheck(
          body['wreck-find-date-year'],
          errors['wreck-find-date']
        );

        return res.render('report/find-date', {
          errors,
          errorSummary,
          values: req.body
        });
      }
    }
  );
}
