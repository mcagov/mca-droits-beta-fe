const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/find-date-answer',
    [
      body('wreck-find-date-day')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your find day'),
      body('wreck-find-date-month')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your find month'),
      body('wreck-find-date-year')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your find year')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      const session = req.session.data['wreck-find-date'];
      const body = req.body;

      for (let key in session) {
        session[key] = body[`wreck-find-date-${key}`];
      }

      if (!errors) {
        return res.render('report/personal');
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
        return res.render('report/find-date', {
          errors,
          errorSummary,
          values: req.body
        });
      }
    }
  );
}
