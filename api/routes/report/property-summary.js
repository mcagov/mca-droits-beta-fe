const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  app.get('/report/property-summary', function (req, res) {
    var removedFlash = false;
    var addedFlash = false;

    if (req.session.data['bulk-upload'] !== 'undefined') {
      req.session.data['bulk-upload'] = {};
    }

    // These are set as hidden fields.
    if (
      req.session.data['property-added-flash'] !== undefined &&
      req.session.data['property-added-flash']
    ) {
      addedFlash = true;
      req.session.data['property-added-flash'] = false;
    }

    // These are set as hidden fields.
    if (
      req.session.data['property-removed-flash'] !== undefined &&
      req.session.data['property-removed-flash']
    ) {
      removedFlash = true;
      req.session.data['property-removed-flash'] = false;
    }

    res.render('report/property-summary', {
      addedFlash: addedFlash,
      removedFlash: removedFlash
    });
  });

  app.post(
    '/report/property-summary-confirmation',
    [
      body('property-declaration')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select to confirm you are happy with the declaration')
    ],
    function (req, res) {
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        return req.session.data.redirectToCheckAnswers
          ? res.redirect('/report/check-your-answers')
          : res.redirect('salvage-award');
      } else {
        return res.render('report/property-summary', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );

  app.get('/report/property-delete/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var property = req.session.data.property;
    var propertyItem = null;

    if (property[rawPropertyID] !== undefined) {
      propertyItem = property[rawPropertyID];
    } else {
      res.redirect('/report/property-summary');
    }

    res.render('report/property-delete', {
      propertyID: rawPropertyID,
      propertyItem: propertyItem
    });
  });

  app.get('/report/property-delete-action/:prop_id', function (req, res) {
    var rawPropertyID = req.params.prop_id;
    var property = req.session.data.property;

    if (property[rawPropertyID] !== undefined) {
      req.session.data['property-removed-flash'] = true;
      delete property[rawPropertyID];
    }

    res.redirect('/report/property-summary');
  });
}
