const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

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
        .withMessage('Enter an email address in the correct format, like name@example.com'),
      body('telephone-number')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your telephone number')
        .isInt()
        .withMessage('Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'),
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
        .withMessage('Please enter a valid postcode')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      const session = req.session.data.personal;
      const body = req.body;

      for (let key in session) {
        session[key] = body[key];
      }

      if (!errors) {
        console.log(req.session.data);
        res.redirect('known-wreck');
      } else {
        return res.render('report/personal', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
