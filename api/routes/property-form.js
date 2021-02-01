const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  
  app.get('/report/property-form/:prop_id',
    function (req, res) {
      var propertyID;
      // Instantiate a counter for the ID in the session data to avoid duplicates.
      req.session.data['property-id-counter'] = req.session.data['property-id-counter'] !== undefined ? req.session.data['property-id-counter'] : 0;

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
    }
  )

  app.post(
    '/report/property-form/:prop_id',
    /*[
      body('property' + '[' + req.params.prop_id + '][description]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter a description of the item'),
      body('property-quantity')
        .exists()
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('Enter how many items have been found that match this description'),
      body('value-known')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select yes if you know the approximate value of the items that match this description')
    ],*/
    async (req, res, next) => {      
      var rawPropertyID = req.params.prop_id;
      req.session.data.property[rawPropertyID] = req.body.property[rawPropertyID];
      
      var property = req.session.data.property;
      var propertyID;
      var propertyItem;

      if (property[rawPropertyID] !== undefined && property[rawPropertyID] !== 'new') {
        propertyID = rawPropertyID;
        propertyItem = property[propertyID];

        await body('property' + '[' + propertyID + '][description]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter a description of the item')
        .run(req);
      await body('property' + '[' + propertyID + '][quantity]')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Enter how many items have been found that match this description')
        .run(req);
      await body('value-known')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select yes if you know the approximate value of the items that match this description')
        .run(req);
      } 

      const errors = formatValidationErrors(validationResult(req));
      
      if (!errors) {
        res.render('report/property-form-image', { propertyID: propertyID, propertyItem: propertyItem });
      }
      else {
        return res.render('report/property-form', {
          propertyID: propertyID, 
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  )
  
  app.get('/report/property-delete/:prop_id', function (req, res) {
  
    var rawPropertyID = req.params.prop_id
    var property = req.session.data.property
    var propertyItem = null
  
    if (property[rawPropertyID] !== undefined) {
      propertyItem = property[rawPropertyID]
    } else {
      res.redirect('/report/property-summary')
    }
  
    res.render('report/property-delete', { propertyID: rawPropertyID, propertyItem: propertyItem })
  })
  
  app.get('/report/property-delete-action/:prop_id', function (req, res) {
  
    var rawPropertyID = req.params.prop_id
    var property = req.session.data.property
  
    if (property[rawPropertyID] !== undefined) {
      delete property[rawPropertyID]
    }
  
    res.redirect('/report/property-summary')
  })
  
}
