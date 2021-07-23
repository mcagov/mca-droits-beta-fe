const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.get('/report/property-form-address/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var propertyID;
    var propertyItem;
    var property = req.session.data.property;

    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
    } else {
      res.redirect('/report/property-summary');
    }

    res.render('report/property-form-address', {
      propertyID: propertyID,
      propertyItem: propertyItem
    });
  });

  app.post(
    '/report/property-form-address-answer/:prop_id',
    async (req, res, next) => {
      var rawPropertyID = req.params.prop_id;
      var bodyProperty = req.body.property[rawPropertyID];
      var property = req.session.data.property;

      if (!req.session.data.property[rawPropertyID]) {
        req.session.data.property[rawPropertyID] =
          req.body.property[rawPropertyID];
      }

      req.session.data.property[rawPropertyID]['address-details'] = {};

      var propertyID;
      var propertyItem;

      property[rawPropertyID]['storage-address'] =
        req.body.property[rawPropertyID]['storage-address'];

      if (property[rawPropertyID] !== undefined) {
        propertyID = rawPropertyID;
      }

      if (!req.body.property[rawPropertyID]['storage-address']) {
        await body('property' + '[' + propertyID + ']["storage-address"]')
          .exists()
          .escape()
          .not()
          .isEmpty()
          .withMessage('Choose an option')
          .run(req);
      }

      if (req.body.property[rawPropertyID]['storage-address'] === 'custom') {
        await body('property' + '[' + propertyID + ']["address-line-1"]')
          .exists()
          .escape()
          .not()
          .isEmpty()
          .withMessage('Enter your building and street')
          .run(req);
        await body('property' + '[' + propertyID + ']["address-line-2"]')
          .escape()
          .run(req);
        await body('property' + '[' + propertyID + ']["address-town"]')
          .exists()
          .escape()
          .not()
          .isEmpty()
          .withMessage('Enter your town or city')
          .run(req);
        await body('property' + '[' + propertyID + ']["address-county"]')
          .exists()
          .escape()
          .not()
          .isEmpty()
          .withMessage('Enter your county')
          .run(req);
        await body('property' + '[' + propertyID + ']["address-postcode"]')
          .exists()
          .escape()
          .not()
          .isEmpty()
          .withMessage('Enter a real postcode')
          .isPostalCode(['GB'])
          .withMessage('Please enter a valid postcode')
          .run(req);
      }

      const errors = formatValidationErrors(validationResult(req));

      if (bodyProperty['storage-address'] === 'custom') {
        req.session.data.property[rawPropertyID]['address-details'][
          'address-line-1'
        ] = req.body.property[rawPropertyID]['address-line-1'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-line-2'
        ] = req.body.property[rawPropertyID]['address-line-2'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-town'
        ] = req.body.property[rawPropertyID]['address-town'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-county'
        ] = req.body.property[rawPropertyID]['address-county'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-postcode'
        ] = req.body.property[rawPropertyID]['address-postcode'];
      } else if (bodyProperty['storage-address'] === 'personal') {
        req.session.data.property[rawPropertyID]['address-details'][
          'address-line-1'
        ] = req.session.data.personal['address-line-1'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-line-2'
        ] = req.session.data.personal['address-line-2'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-town'
        ] = req.session.data.personal['address-town'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-county'
        ] = req.session.data.personal['address-county'];
        req.session.data.property[rawPropertyID]['address-details'][
          'address-postcode'
        ] = req.session.data.personal['address-postcode'];
      }

      /**
       * Replacing decimals with dashes so the error summary
       * can link to correct input element
       */
      for (let prop in errors) {
        errors[prop].id = `${errors[prop].id.replace(/\./g, '-')}`;
        errors[prop].href = `#${errors[prop].id.replace(/\./g, '-')}`;
      }

      if (!errors) {
        req.session.data['property-added-flash'] = true;
        res.redirect('/report/property-summary');
      } else {
        return res.render('report/property-form-address', {
          propertyID: propertyID,
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
