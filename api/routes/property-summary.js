const { body, validationResult } = require('express-validator');

import { formatValidationErrors } from '../../utils';

export default function (app) {

  app.get('/report/property-summary/new',
    function (req, res) {
      return res.render('report/property-form');
    }

  );
}
