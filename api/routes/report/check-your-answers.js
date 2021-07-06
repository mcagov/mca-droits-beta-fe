import axios from 'axios';
const { body, validationResult } = require('express-validator');
import fs from 'fs';
import path from 'path';
var cloneDeep = require('lodash.clonedeep');
import { azureUpload } from '../../../services';
import { formatValidationErrors } from '../../../utilities';

export default function (app) {
  // If user clicks back button on confirmation page it will redirect to start page
  app.get('/report/check-your-answers', function (req, res, next) {
    if (Object.keys(req.session.data['report-date']).length == 0) {
      return res.redirect('/report/start');
    }
    next();
  });

  app.post(
    '/report/confirmation',
    [
      body('property-declaration')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Select to confirm you are happy with the declaration'),
    ],
    async function (req, res) {
      const errors = formatValidationErrors(validationResult(req));
      const sd = cloneDeep(req.session.data);
      let reference;

      // Errors
      if (errors) {
        return res.render('report/check-your-answers', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body,
        });
      } else {
        // Generate a report reference
        try {
          const response = await axios.get(
            process.env.REFERENCE_GENERATOR_URL,
            {
              headers: {
                'x-functions-key': process.env.REFERENCE_GENERATOR_KEY,
              },
            }
          );
          reference = response.data;
        } catch (err) {
          console.error(err);
        }

        // Check if values exist in session
        let textLocation = sd['location']['text-location'].trimEnd();
        let locationDescription = sd['location']['location-description'];
        let formattedTextLocation;
        // If user has chosen to provide the location in text form rather than coordinates, 
        // format the text so it can be concatenated with any (optional) additional details/description text
        if (textLocation.length) {
          formattedTextLocation = textLocation.endsWith(".") ? textLocation : textLocation + ".";
        }
        let concatenatedText = formattedTextLocation + " " + locationDescription;
        const locationDetails = formattedTextLocation !== undefined ? concatenatedText : locationDescription;

        // Data obj to send to db
        const data = {
          reference,
          'report-date': `${sd['report-date']['year']}-${sd['report-date']['month']}-${sd['report-date']['day']}`,
          'wreck-find-date': `${sd['wreck-find-date']['year']}-${sd['wreck-find-date']['month']}-${sd['wreck-find-date']['day']}`,
          latitude: sd['location']['location-standard']['latitude'],
          longitude: sd['location']['location-standard']['longitude'],
          'location-radius': sd['location']['location-standard']['radius'],
          'location-description': locationDetails,
          'vessel-name': sd['vessel-information']['vessel-name'],
          'vessel-construction-year':
            sd['vessel-information']['vessel-construction-year'],
          'vessel-sunk-year': sd['vessel-information']['vessel-sunk-year'],
          'vessel-depth': sd['vessel-depth'],
          'removed-from': sd['removed-from'],
          'wreck-description': sd['wreck-description'],
          'claim-salvage': sd['claim-salvage'],
          'salvage-services': sd['salvage-services'],
          personal: {
            'full-name': sd['personal']['full-name'],
            email: sd['personal']['email'],
            'telephone-number': sd['personal']['telephone-number'],
            'address-line-1': sd['personal']['address-line-1'],
            'address-line-2': sd['personal']['address-line-2'],
            'address-town': sd['personal']['address-town'],
            'address-county': sd['personal']['address-county'],
            'address-postcode': sd['personal']['address-postcode'],
          },
          'wreck-materials': [],
        };

        // adding properties to wreck materials array
        for (const prop in sd['property']) {
          if (sd['property'].hasOwnProperty(prop)) {
            let innerObj = {};
            innerObj = sd['property'][prop];

            // Prepend azure blob container url path
            innerObj.image = `${process.env.AZURE_BLOB_IMAGE_URL}${innerObj.image}`;
            data['wreck-materials'].push(innerObj);
          }
        }

        // console.log('[final data]:', JSON.stringify(data, null, 2));

        // Post data to db
        try {
          const response = await axios.post(
            process.env.DB_POST_URL,
            JSON.stringify(data),
            {
              headers: { 'content-type': 'application/json' },
            }
          );
          if (response.statusText === 'Accepted') {
            // Push image(s) to Azure
            Object.values(req.session.data.property).forEach((item) => {
              const imageData = fs.createReadStream(
                `${path.resolve(__dirname + '../../../../uploads/')}/${item.image
                }`
              );

              azureUpload(imageData, item.image);
            });

            // Clear session data
            req.session.data = {};

            return res.render('report/confirmation', { reference });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  );
}
