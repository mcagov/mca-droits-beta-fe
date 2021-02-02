const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {

  app.get('/report/property-form-address/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var propertyID;
    var propertyItem;
    var property = req.session.data.property
  
    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
    } else {
      res.redirect('/report/property-summary');
    }
  
    res.render('report/property-form-address', { propertyID: propertyID, propertyItem: propertyItem });
  })

  app.post(
    '/report/property-form-address-answer/:prop_id', 
    [
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
        .withMessage('Enter your postcode')
    ],
    function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var propertyID;
    var propertyItem;

    var property = req.session.data.property;
    //var sessionProperty = req.session.data.property[rawPropertyID];
    var bodyProperty = req.body.property[rawPropertyID];

    property[rawPropertyID]['storage-address'] = req.body.property[rawPropertyID]['storage-address']; 

    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
    }

    const errors = formatValidationErrors(validationResult(req));

    if (bodyProperty['storage-address'] === 'custom') {
      for (let key in bodyProperty) {
        console.log(bodyProperty);
        property[propertyID][key] = bodyProperty[key];

        return res.render('report/property-form-address', {
          propertyID: propertyID,
          propertyItem: propertyItem,
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }

    res.redirect('/report/property-summary');
  })
}