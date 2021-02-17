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

      if (errors) {
        return res.render('report/check-your-answers', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      } else {
        const data = Object.assign({}, req.session.data);

        delete data.location['location-type'];
        delete data.location['location-latitude-decimal'];
        delete data.location['location-longitude-decimal'];
        delete data.location['location-latitude-degrees-degree'];
        delete data.location['location-latitude-degrees-minute'];
        delete data.location['location-latitude-degrees-second'];
        delete data.location['location-latitude-degrees-direction'];
        delete data.location['location-longitude-degrees-degree'];
        delete data.location['location-longitude-degrees-minute'];
        delete data.location['location-longitude-degrees-second'];
        delete data.location['location-longitude-degrees-direction'];
        delete data['property-id-counter'];
        delete data['redirectToCheckAnswers'];

        console.log('[data]:', data);

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
