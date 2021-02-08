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
    async (req, res, next) => {
    var rawPropertyID = req.params.prop_id;
    var bodyProperty = req.body.property[rawPropertyID];
    var property = req.session.data.property;

    if(!req.session.data.property[rawPropertyID]) {
      req.session.data.property[rawPropertyID] = req.body.property[rawPropertyID];
    }
    
    if (bodyProperty['storage-address'] === 'custom') {
      /*for (let key in bodyProperty) {
        property[rawPropertyID][key] = bodyProperty[key];
      }*/

      req.session.data.property[rawPropertyID]['address-details'] = {};
      req.session.data.property[rawPropertyID]['address-details']['address-line-1'] = req.body.property[rawPropertyID]['address-line-1'];
      req.session.data.property[rawPropertyID]['address-details']['address-town'] = req.body.property[rawPropertyID]['address-town'];
      req.session.data.property[rawPropertyID]['address-details']['address-county'] = req.body.property[rawPropertyID]['address-county'];
      req.session.data.property[rawPropertyID]['address-details']['address-postcode'] = req.body.property[rawPropertyID]['address-postcode'];
    }

    var propertyID;
    var propertyItem;

    property[rawPropertyID]['storage-address'] = req.body.property[rawPropertyID]['storage-address'];

    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
    }

    if (req.body.property[rawPropertyID]['storage-address'] === 'custom') {

      await body('property' + '[' + propertyID + ']["address-line-1"]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your building and street')
        .run(req);
      await body('property' + '[' + propertyID + ']["address-town"]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your town or city')
        .run(req);
      await body('property' + '[' + propertyID + ']["address-county"]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your county')
        .run(req);
      await body('property' + '[' + propertyID + ']["address-postcode"]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter your postcode')
        .run(req);
      
        const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        res.redirect('/report/property-summary');
      } else {
        return res.render('report/property-form-address', {
          propertyID: propertyID,
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }  
    } else {
      res.redirect('/report/property-summary');
    }
  })
}