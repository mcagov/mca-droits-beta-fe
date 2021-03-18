const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.post(
    '/report/removed-property-check-answer',
    [
      body('removed-property')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select yes if you have removed the wreck material'),
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      if (!errors) {
        req.session.data['removed-property'] = req.body['removed-property'];

        const value = req.session.data['removed-property'];

        const date = new Date();
        const day = date.getDate(),
          month = date.getMonth() + 1,
          year = date.getFullYear();

        req.session.data['report-date']['day'] = ('0' + day).slice(-2);
        req.session.data['report-date']['month'] = ('0' + month).slice(-2);
        req.session.data['report-date']['year'] = year;

        if (value === 'yes') {
          return req.session.data.redirectToCheckAnswers
            ? res.redirect('/report/check-your-answers')
            : res.redirect('find-date');
        } else {
          return res.redirect('not-removed-property-content');
        }
      } else {
        return res.render('report/removed-property-check', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body,
        });
      }
    }
  );
}
