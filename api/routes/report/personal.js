const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.post(
    '/report/personal-answer',
    [
      body('full-name')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your full name'),
      body('email')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your email address')
        .isEmail()
        .withMessage(
          'Enter an email address in the correct format, like name@example.com'
        ),
      body('telephone-number')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
          const format = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
          const formatted = format.test(value);

          if (!formatted) {
            throw new Error(
              'Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'
            );
          }
          return true;
        }),
      body('address-line-1')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your building and street'),
      body('address-town')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your town or city'),
      body('address-county')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your county'),
      body('address-postcode')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter a real postcode')
        .isPostalCode(['GB'])
        .withMessage('Please enter a valid postcode'),
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      const session = req.session.data.personal;
      const body = req.body;

      // loop through default session data keys defined in /api/data/session-data-defaults.js
      for (let key in session) {
        session[key] = body[key];
      }

      if (!errors) {
        return req.session.data.redirectToCheckAnswers
          ? res.redirect('/report/check-your-answers')
          : res.redirect('known-wreck');
      } else {
        return res.render('report/personal', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body,
        });
      }
    }
  );
}
