const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {
  
  app.get('/report/property-form/:prop_id',
    function (req, res) {
      var propertyID;
      // Instantiate a counter for the ID in the session data to avoid duplicates.
      req.session.data['property-id-counter'] = req.session.data['property-id-counter'] !== undefined ? req.session.data['property-id-counter'] : 0;

      // Instantiate the property object itself in the session data so we can assume its existance later.
      req.session.data.property = req.session.data.property !== undefined ? req.session.data.property : {};

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

  app.all('/report/property-form-image/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    console.log(rawPropertyID);
    var propertyID;
    var propertyItem;
    console.log(req.body);

    req.session.data['property'] = req.body;   
    console.log(req.session.data['property'][rawPropertyID]);
    req.session.data['property'][rawPropertyID]['value'] = req.session.data['property'][rawPropertyID]['value'] ? req.body['property-value'] : 'unknown'; 
    
    var property = req.session.data.property;
    console.log(property);

    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
      console.log(propertyItem);
    } else {
      res.redirect('property-summary');
    }
  
    res.render('report/property-form-image', { propertyID: propertyID, propertyItem: propertyItem });
  })

  app.all('/report/property-form-address/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var propertyID;
    var propertyItem;
    var property = req.session.data.property
    console.log(req.session.data);
  
    if (property[rawPropertyID] !== undefined) {
      propertyID = rawPropertyID;
      propertyItem = property[propertyID];
    } else {
      res.redirect('/report/property-summary');
    }
  
    res.render('report/property-form-address', { propertyID: propertyID, propertyItem: propertyItem });
  })
  
  app.get('/report/property-delete/:prop_id', function (req, res) {
    // This is a janky router to try simulate a delete page for property. It contains many flaws.
  
    // Instantiate the property object itself in the session data so we can assume its existance later.
    req.session.data.property = req.session.data.property !== undefined ? req.session.data.property : {}
  
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
    // This is a janky router to try simulate a delete page for property. It contains many flaws.
  
    // Instantiate the property object itself in the session data so we can assume its existance later.
    req.session.data.property = req.session.data.property !== undefined ? req.session.data.property : {}
  
    var rawPropertyID = req.params.prop_id
    var property = req.session.data.property
    var propertyItem = null
  
    if (property[rawPropertyID] !== undefined) {
      delete property[rawPropertyID]
    }
  
    res.redirect('/report/property-summary')
  })
  
  app.get('/report/property-summary', function (req, res) {
    var removedFlash = false
    var addedFlash = false
  
    // These are set as hidden fields.
    if (req.session.data['property-added-flash'] !== undefined && req.session.data['property-added-flash']) {
      addedFlash = true
      req.session.data['property-added-flash'] = false
    }
  
    // These are set as hidden fields.
    if (req.session.data['property-removed-flash'] !== undefined && req.session.data['property-removed-flash']) {
      removedFlash = true
      req.session.data['property-removed-flash'] = false
    }
  
    res.render('report/property-summary', { addedFlash: addedFlash, removedFlash: removedFlash })
  })
}
