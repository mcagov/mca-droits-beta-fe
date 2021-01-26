const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  
  app.get('/report/property-form/:prop_id',
    function (req, res) {
      // Instantiate a counter for the ID in the session data to avoid duplicates.
      req.session.data['property-id-counter'] = req.session.data['property-id-counter'] !== undefined ? req.session.data['property-id-counter'] : 0

      // Instantiate the property object itself in the session data so we can assume its existance later.
      req.session.data.property = req.session.data.property !== undefined ? req.session.data.property : {}

      var rawPropertyID = req.params.prop_id
      var property = req.session.data.property 

      // If our ID is the string "new", we're creating a new item of property.
      if (rawPropertyID === 'new') {
        // Generate the new ID and increment the counter for next time.
        // Explaination of why we append an "i": https://stackoverflow.com/a/22198251
        propertyID = 'i' + req.session.data['property-id-counter']
        req.session.data['property-id-counter']++
      } else {
        // Otherwise we check if we're getting an existing ID and throw a 404 otherwise.
        if (property[rawPropertyID] !== undefined) {
          propertyID = rawPropertyID
        } else {
          res.redirect('/report/property-summary')
        }
      }

      res.render('report/property-form', { propertyID: propertyID })
    }

  );

  router.all('/report/property-form-image/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id
    var property = req.session.data.property
  
    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
    } else {
      res.redirect('/report/property-summary');
    }
  
    res.render('report/property-form-image', { propertyID: propertyID, propertyItem: propertyItem });
  })
  
  router.all('/report/property-form-address/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id
    var property = req.session.data.property
  
    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
    } else {
      res.redirect('/report/property-summary');
    }
  
    res.render('report/property-form-address', { propertyID: propertyID, propertyItem: propertyItem });
  })
}
