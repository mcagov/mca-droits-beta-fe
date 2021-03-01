import axios from 'axios';
const { body, validationResult } = require('express-validator');
import fs from 'fs';
import path from 'path';
var cloneDeep = require('lodash.clonedeep');
import { azureUpload } from '../../../services';
import { formatValidationErrors } from '../../../utils';

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
      const sd = cloneDeep(req.session.data);
      const blobUrl =
        'https://mcadevelopmentstorage.blob.core.windows.net/report-uploads/';
      const postUrl =
        'https://prod-05.uksouth.logic.azure.com:443/workflows/7eb0e5d4ba61419b9fc3a100c1d2b55e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dlIj2NC1JL2pRXGbH0ZMo_B1YbJDm_JKvE0PTEI1F5k&Content-Type=application/json';

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

            // Prepend azure blob container url path
            innerObj.image = `${blobUrl}${innerObj.image}`;
            data['wreck-materials'].push(innerObj);
          }
        }

        console.log('[final data]:', JSON.stringify(data, null, 2));

        // Post data to db
        try {
          const response = await axios.post(postUrl, JSON.stringify(data), {
            headers: { 'content-type': 'application/json' }
          });
          if (response.statusText === 'Accepted') {
            Object.values(req.session.data.property).forEach((item) => {
              const imageData = fs.createReadStream(
                `${path.resolve(__dirname + '/../../uploads/')}/${item.image}`
              );

              azureUpload(imageData, item.image);
            });
            return res.redirect('/report/confirmation');
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  );
}
