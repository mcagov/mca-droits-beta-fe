const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {

  app.get('/report/property-summary', function (req, res) {
    var removedFlash = false
    var addedFlash = false
    
    console.log(req.session.data);
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

  app.get('/report/salvage', function (req, res) {
  
    res.render('report/salvage-award', { addedFlash: addedFlash, removedFlash: removedFlash })
  })
}