const { body, validationResult } = require('express-validator');
import { formatValidationErrors } from '../../../utilities';
const dayjs = require('dayjs');

const inRange = require('lodash.inrange');
const dayRange = (val) => inRange(val, 1, 31) || val == 31;
const monthRange = (val) => inRange(val, 1, 12) || val == 12;

export default function (app) {
  app.post(
    '/report/find-date-answer',
    [
      body('wreck-find-date-day')
        .exists()
        .escape()
        .custom((val) => {
          if (!dayRange(val)) {
            throw new Error('Day must be between 1 and 31');
          }
          return true;
        })
        .isNumeric()
        .withMessage('Enter a number')
        .not()
        .isEmpty()
        .withMessage('Enter your find day'),
      body('wreck-find-date-month')
        .exists()        
        .escape()
        .custom((val) => {
          if (!monthRange(val)) {
            throw new Error('Month must be between 1 and 12');
          }
          return true;
        })
        .isNumeric()
        .withMessage('Enter a number')
        .not()
        .isEmpty()
        .withMessage('Enter your find month'),
      body('wreck-find-date-year')
        .exists()
        .escape()
        .isNumeric()
        .withMessage('Enter a number')
        .custom((val) => {
          if (val.length !== 4) {
            throw new Error('Enter a valid year');
          }
          return true;
        })
        .not()
        .isEmpty()
        .withMessage('Enter your find year'),
    ],
    function (req, res) {
      let errors = formatValidationErrors(validationResult(req));
      let errorSummary;
      const session = req.session.data['wreck-find-date'];
      const body = req.body;
      const dayValue = body['wreck-find-date-day'];
      const monthValue = body['wreck-find-date-month'];
      const yearValue = body['wreck-find-date-year'];

      // Checking whether date submitted is after todays date
      const allValsEntered =
        dayValue.length > 0 &&
        monthValue.length > 0 &&
        yearValue.length > 0;

      // If all input boxes have content
      if (allValsEntered) {
        const now = dayjs();
        const submitted = dayjs(
          `${yearValue}-${monthValue}-${dayValue}`
        );

        // If date (parsed by dayjs) is after current date
        if (dayjs(submitted).isAfter(now)) {
          // Contruct new error obj
          errors = {};
          errors['wreck-find-date'] = {
            id: 'wreck-find-date',
            href: '#wreck-find-date',
            text: 'Enter a date in the past',
          };
          // Needed to target all input boxes on the frontend
          errors['wreck-find-date-day'] = {};
          errors['wreck-find-date-month'] = {};
          errors['wreck-find-date-year'] = {};
        }
        errorSummary = Object.values(errors);
      }

      // Add values to session data
      for (let key in session) {
        session[key] = body[`wreck-find-date-${key}`];
      }

      if (!errors) {
        return req.session.data.redirectToCheckAnswers
          ? res.redirect('/report/check-your-answers')
          : res.redirect('personal');
      } else {
        if (!allValsEntered) {
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
              href: `#${firstDateErrorId}`,
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

          errorSummary = Object.values(errors);

          if (dateErrors) {
            // Remove all other errors from the summary so we only have one message.
            errorSummary = errorSummary.filter(
              (error) => !error.id.includes(`${prefix}-`)
            );
          }

          const day = errors['wreck-find-date-day'];
          const month = errors['wreck-find-date-month'];
          const year = errors['wreck-find-date-year'];
          const errorObj = errors['wreck-find-date'];
          const numberErrorText = 'Enter a number';
          const dayRangeErrorText = 'Day must be between 1 and 31';
          const monthRangeErrorText = 'Month must be between 1 and 12';
          const yearRangeErrorText = 'Enter a valid year';

          // Override error text to validate for numbers
          if (
            (typeof day !== 'undefined' && day.text === numberErrorText) ||
            (typeof month !== 'undefined' && month.text === numberErrorText) ||
            (typeof year !== 'undefined' && year.text === numberErrorText)
          ) {
            errorObj.text = numberErrorText;
          }

          // Override error text to validate for number format/range
          if (typeof day !== 'undefined' && day.text === dayRangeErrorText) {
            errors['wreck-find-date'].text = dayRangeErrorText;
          }
          if (
            typeof month !== 'undefined' &&
            month.text === monthRangeErrorText
          ) {
            errors['wreck-find-date'].text = monthRangeErrorText;
          }
          if (typeof year !== 'undefined' && year.text === yearRangeErrorText) {
            errors['wreck-find-date'].text = yearRangeErrorText;
          }
        }

        return res.render('report/find-date', {
          errors,
          errorSummary,
          values: req.body,
        });
      }
    }
  );
}
