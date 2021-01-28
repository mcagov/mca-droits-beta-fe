const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {

  app.all('/report/property-form-address/:prop_id', function (req, res) {
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

  app.post('/report/property-form-address-answer/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var sessionProperty = req.session.data.property[rawPropertyID];
    var bodyProperty = req.body.property[rawPropertyID];

    if (bodyProperty['storage-address'] === 'custom') {
      for (let key in bodyProperty) {
        sessionProperty[key] = bodyProperty[key];
      }
    } else {
      sessionProperty['storage-address'] = bodyProperty['storage-address'];
    }

    res.redirect('/report/property-summary');
  })
}