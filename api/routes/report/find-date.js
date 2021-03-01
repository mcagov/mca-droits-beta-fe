const { body, validationResult } = require('express-validator');
import validator from 'validator';

import { formatValidationErrors } from '../../../utils';

export default function (app) {
  app.post(
    '/report/find-date-answer',
    [
      body('wreck-find-date-day')
        .exists()
        .isNumeric()
        .withMessage('Enter a number')
        .not()
        .isEmpty()
        .withMessage('Enter your find day'),
      body('wreck-find-date-month')
        .exists()
        .isNumeric()
        .withMessage('Enter a number')
        .not()
        .isEmpty()
        .withMessage('Enter your find month'),
      body('wreck-find-date-year')
        .exists()
        .isNumeric()
        .withMessage('Enter a number')
        .not()
        .isEmpty()
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
        return req.session.data.redirectToCheckAnswers
          ? res.redirect('/report/check-your-answers')
          : res.redirect('personal');
      } else {
        // If any of the date inputs error apply a general error.
        let prefix = 'wreck-find-date';
        const dateErrors = Object.values(errors).filter((error) =>
          error.id.includes(`${prefix}-`)
        );

        if (dateErrors) {
          const firstDateErrorId = dateErrors[0].id;

          // Get the first error message and merge it into a single error message.
          errors[prefix] = {
            id: prefix,
            href: `#${firstDateErrorId}`
          };

          // Construct a single error message based on all three error messages.
          errors[prefix].text = 'Enter your find ';
          if (dateErrors.length === 3) {
            errors[prefix].text += 'date';
          } else {
            errors[prefix].text += dateErrors
              .map((error) => error.text.replace('Enter your find ', ''))
              .join(' and ');
          }
        }

        let errorSummary = Object.values(errors);

        if (dateErrors) {
          // Remove all other errors from the summary so we only have one message.
          errorSummary = errorSummary.filter(
            (error) => !error.id.includes(`${prefix}-`)
          );
        }

        // Need to manually override the error text to validate for numbers
        if (
          (body['wreck-find-date-day'].length > 0 &&
            !validator.isNumeric(body['wreck-find-date-day'])) ||
          (body['wreck-find-date-month'].length > 0 &&
            !validator.isNumeric(body['wreck-find-date-month'])) ||
          (body['wreck-find-date-year'].length > 0 &&
            !validator.isNumeric(body['wreck-find-date-year']))
        ) {
          errors['wreck-find-date'].text = 'Enter a number';
        }

        return res.render('report/find-date', {
          errors,
          errorSummary,
          values: req.body
        });
      }
    }
  );
}
