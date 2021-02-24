import axios from 'axios';
const { body, validationResult } = require('express-validator');
import fs from 'fs';
import path from 'path';
import { azureUpload } from '../../services';
import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/check-your-answers',
    [
      body('property-declaration')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select to confirm you are happy with the declaration')
    ],
    async function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      const sd = req.session.data;

      if (errors) {
        return res.render('report/check-your-answers', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      } else {
        const data = {
          reference: sd['reference'],
          'report-date': `${sd['report-date']['year']}-${sd['report-date']['month']}-${sd['report-date']['day']}`,
          'wreck-find-date': `${sd['wreck-find-date']['year']}-${sd['wreck-find-date']['month']}-${sd['wreck-find-date']['day']}`,
          latitude: sd['location']['location-standard']['latitude'],
          longitude: sd['location']['location-standard']['longitude'],
          'location-radius': sd['location']['location-standard']['radius'],
          'location-description': '',
          'vessel-name': sd['vessel-information']['vessel-name'],
          'vessel-construction-year':
            sd['vessel-information']['vessel-construction-year'],
          'vessel-sunk-year': sd['vessel-information']['vessel-sunk-year'],
          'vessel-depth': sd['vessel-depth'],
          'removed-from': sd['removed-from'],
          'wreck-description': sd['wreck-description'],
          'salvage-services': sd['salvage-services'],
          personal: {
            'full-name': sd['personal']['full-name'],
            email: sd['personal']['email'],
            'telephone-number': sd['personal']['telephone-number'],
            'address-line-1': sd['personal']['address-line-1'],
            'address-line-2': sd['personal']['address-line-2'],
            'address-town': sd['personal']['address-town'],
            'address-county': sd['personal']['address-county'],
            'address-postcode': sd['personal']['address-postcode']
          },
          'wreck-materials': []
        };

        // adding properties to wreck materials array
        for (const prop in sd['property']) {
          if (sd['property'].hasOwnProperty(prop)) {
            let innerObj = {};
            innerObj = sd['property'][prop];
            data['wreck-materials'].push(innerObj);
          }
        }

        console.log('[data]:', JSON.stringify(data, null, 2));

        // Post data to db
        // try {
        //   const response = await axios.post(
        //     //url,
        //     JSON.stringify(data)
        //   );
        //   if (response.statusText === 'OK') {
        //     Object.values(req.session.data.property).forEach((item) => {
        //       const data = fs.createReadStream(
        //         `${path.resolve(__dirname + '/../../uploads/')}/${item.image}`
        //       );

        //       azureUpload(data, item.image);
        //     });
        //   }
        //   return res.redirect('/report/confirmation');
        // } catch (err) {
        //   console.error(err);
        // }
      }
    }
  );
}
