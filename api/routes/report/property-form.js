const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.get('/report/property-form/:prop_id', function (req, res) {
    var propertyID;
    // Instantiate a counter for the ID in the session data to avoid duplicates.
    req.session.data['property-id-counter'] =
      req.session.data['property-id-counter'] !== undefined
        ? req.session.data['property-id-counter']
        : 0;

    var rawPropertyID = req.params.prop_id;
    var property = req.session.data.property;

    // If our ID is the string "new", we're creating a new item of property.
    if (rawPropertyID === 'new') {
      // Generate the new ID and increment the counter for next time.
      // Explaination of why we append an "i": https://stackoverflow.com/a/22198251
      propertyID = 'i' + req.session.data['property-id-counter'];
      req.session.data['property-id-counter']++;
    } else {
      // Otherwise we check if we're getting an existing ID and throw a 404 otherwise.
      if (property[rawPropertyID] !== undefined) {
        propertyID = rawPropertyID;
      } else {
        res.redirect('/report/property-summary');
      }
    }

    res.render('report/property-form', { propertyID: propertyID });
  });

  app.post('/report/property-form-image/:prop_id', async (req, res, next) => {
    var rawPropertyID = req.params.prop_id;

    if (!req.session.data.property[rawPropertyID]) {
      req.session.data.property[rawPropertyID] =
        req.body.property[rawPropertyID];
    }

    req.session.data.property[rawPropertyID].description =
      req.body.property[rawPropertyID].description;
    req.session.data.property[rawPropertyID]['quantity'] =
      req.body.property[rawPropertyID].quantity;
    req.session.data.property[rawPropertyID]['value-known'] =
      req.body['value-known'];
    req.session.data.property[rawPropertyID]['value'] =
      req.body.property[rawPropertyID].value;

    var property = req.session.data.property;
    var propertyID;
    var propertyItem;

    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];

      await body('property' + '[' + propertyID + '][description]')
        .exists()
        .escape()
        .not()
        .isEmpty()
        .withMessage('Enter a description of the item')
        .run(req);
      await body('property' + '[' + propertyID + '][quantity]')
        .exists()
        .escape()
        .isNumeric()
        .withMessage('Enter a number')
        .not()
        .isEmpty()
        .withMessage(
          'Enter how many items have been found that match this description'
        )
        .run(req);
      await body('value-known')
        .exists()
        .escape()
        .not()
        .isEmpty()
        .withMessage(
          'Select yes if you know the approximate value of the items that match this description'
        )
        .run(req);

      if (req.body['value-known'] === 'yes') {
        await body('property' + '[' + propertyID + '][value]')
          .exists()
          .escape()
          .isNumeric()
          .withMessage('Enter a number')
          .not()
          .isEmpty()
          .withMessage('Enter approximate value')
          .run(req);
      }
    }
    const errors = formatValidationErrors(validationResult(req));

    if (!errors) {
      res.render('report/property-form-image', {
        propertyID: propertyID,
        propertyItem: propertyItem
      });
    } else {
      return res.render('report/property-form', {
        propertyID: propertyID,
        errors,
        errorSummary: Object.values(errors),
        values: req.body
      });
    }
  });
}
