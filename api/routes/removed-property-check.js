const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/removed-property-check-answer',
    [
      body('removed-property')
        .exists()
        .not()
        .isEmpty()
        .withMessage('You must choose an option')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      if (errors) {
        return res.render('report/removed-property-check', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
      // Get the answer from session data
      // The name between the quotes is the same as the 'name' attribute on the input elements
      // However in JavaScript we can't use hyphens in variable names
      const value = req.session.data['removed-property'];

      // Throw the current date in here as it's a good a place as any!
      const date = new Date();
      const day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear();

      // We add 0 to the start of the date and slice the last two digits off to ensure leading zeros.
      req.session.data['report-date'] = {};
      req.session.data['report-date']['day'] = ('0' + day).slice(-2);
      req.session.data['report-date']['month'] = ('0' + month).slice(-2);
      req.session.data['report-date']['year'] = year;

      if (value === 'yes') {
        res.redirect('find-date');
      } else {
        res.redirect('not-removed-property-content');
      }
    }
  );
}
