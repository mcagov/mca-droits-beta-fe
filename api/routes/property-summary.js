const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {

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

  app.post(
    '/report/property-summary', 
    [
      body('property-declaration')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select to confirm you are happy with the declaration')
    ],
    function(req, res) {
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        res.redirect('salvage-award');

      } else {
        return res.render('report/property-summary', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
  })

  app.get('/report/salvage', function (req, res) {
  
    res.render('report/salvage-award', { addedFlash: addedFlash, removedFlash: removedFlash })
  })
}