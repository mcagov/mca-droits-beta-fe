import { body, validationResult } from 'express-validator';
const api = require('@what3words/api');

import { formatValidationErrors } from '../../utils';

api.setOptions({ key: '0LFRBQX2' });

export default function (app) {
  app.post(
    '/report/location-answer',
    body('location-type')
      .exists()
      .not()
      .isEmpty()
      .withMessage('Choose an option'),
    async (req, res, next) => {
      const session = req.session.data.location;
      const reqBody = req.body;

      const type = reqBody['location-type'];

      session['location-type'] = type;

      switch (type) {
        case 'coords-decimal':
          session['location-latitude-decimal'] =
            reqBody['location-latitude-decimal'];
          session['location-longitude-decimal'] =
            reqBody['location-longitude-decimal'];

          session['location-standard'].latitude =
            reqBody['location-latitude-decimal'];
          session['location-standard'].longitude =
            reqBody['location-longitude-decimal'];
          session['location-standard'].radius = 0;

          session[
            'location-given'
          ].latitude = `${session['location-standard'].latitude}°`;
          session[
            'location-given'
          ].longitude = `${session['location-standard'].longitude}°`;

          // handle errors
          //TODO Errors need to be displayed underneath all inputs, they currently break layout
          //Need to be similar to find-date page
          await body('location-latitude-decimal')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a latitude')
            .run(req);
          await body('location-longitude-decimal')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a longitude')
            .run(req);

          break;
        case 'coords-decimal-minutes':
          session['location-latitude-decimal-minutes-degree'] =
            reqBody['location-latitude-decimal-minutes-degree'];
          session['location-latitude-decimal-minutes-minute'] =
            reqBody['location-latitude-decimal-minutes-minute'];
          session['location-latitude-decimal-minutes-direction'] =
            reqBody['location-latitude-decimal-minutes-direction'];
          session['location-longitude-decimal-minutes-degree'] =
            reqBody['location-longitude-decimal-minutes-degree'];
          session['location-longitude-decimal-minutes-minute'] =
            reqBody['location-longitude-decimal-minutes-minute'];
          session['location-longitude-decimal-minutes-direction'] =
            reqBody['location-longitude-decimal-minutes-direction'];

          var latD = Number.parseFloat(
            session['location-latitude-decimal-minutes-degree']
          );
          var latM = Number.parseFloat(
            session['location-latitude-decimal-minutes-minute']
          );
          var latDir = session['location-latitude-decimal-minutes-direction'];
          var lonD = Number.parseFloat(
            session['location-longitude-decimal-minutes-degree']
          );
          var lonM = Number.parseFloat(
            session['location-longitude-decimal-minutes-minute']
          );
          var lonDir = session['location-longitude-decimal-minutes-direction'];

          var latitude = latD + latM / 60;
          var longitude = lonD + lonM / 60;

          if (latDir == 'S') {
            latitude = latitude * -1;
          }
          if (lonDir == 'W') {
            longitude = longitude * -1;
          }

          session['location-standard'].latitude = latitude.toFixed(5);
          session['location-standard'].longitude = longitude.toFixed(5);
          session['location-standard'].radius = 0;

          session['location-given'].latitude = `${latD}° ${latM}' ${latDir}`;
          session['location-given'].longitude = `${lonD}° ${lonM}' ${lonDir}`;

          // handle errors
          await body('location-latitude-decimal-minutes-degree')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a latitude degree')
            .run(req);
          await body('location-latitude-decimal-minutes-minute')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter latitude minutes')
            .run(req);
          await body('location-longitude-decimal-minutes-degree')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a longitude degree')
            .run(req);
          await body('location-longitude-decimal-minutes-minute')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter longitude minutes')
            .run(req);

          break;
        case 'coords-sexagesimal':
          session['location-latitude-degrees-degree'] =
            reqBody['location-latitude-degrees-degree'];
          session['location-latitude-degrees-minute'] =
            reqBody['location-latitude-degrees-minute'];
          session['location-latitude-degrees-second'] =
            reqBody['location-latitude-degrees-second'];
          session['location-latitude-degrees-direction'] =
            reqBody['location-latitude-degrees-direction'];
          session['location-longitude-degrees-degree'] =
            reqBody['location-longitude-degrees-degree'];
          session['location-longitude-degrees-minute'] =
            reqBody['location-longitude-degrees-minute'];
          session['location-longitude-degrees-second'] =
            reqBody['location-longitude-degrees-second'];
          session['location-longitude-degrees-direction'] =
            reqBody['location-longitude-degrees-direction'];

          var latD = Number.parseFloat(
            session['location-latitude-degrees-degree']
          );
          var latM = Number.parseFloat(
            session['location-latitude-degrees-minute']
          );
          const latS = Number.parseFloat(
            session['location-latitude-degrees-second']
          );
          var latDir = session['location-latitude-degrees-direction'];
          var lonD = Number.parseFloat(
            session['location-longitude-degrees-degree']
          );
          var lonM = Number.parseFloat(
            session['location-longitude-degrees-minute']
          );
          const lonS = Number.parseFloat(
            session['location-longitude-degrees-second']
          );
          var lonDir = session['location-longitude-degrees-direction'];

          var latitude = latD + latM / 60 + latS / 3600;
          var longitude = lonD + lonM / 60 + lonS / 3600;
          var latitude = latD + latM / 60;
          var longitude = lonD + lonM / 60;

          if (latDir == 'S') {
            latitude = latitude * -1;
          }
          if (lonDir == 'W') {
            longitude = longitude * -1;
          }

          session['location-standard'].latitude = latitude.toFixed(5);
          session['location-standard'].longitude = longitude.toFixed(5);
          session['location-standard'].radius = 0;

          session[
            'location-given'
          ].latitude = `${latD}° ${latM}' ${latS}" ${latDir}`;
          session[
            'location-given'
          ].longitude = `${lonD}° ${lonM}' ${lonS}" ${lonDir}`;

          // handle errors
          await body('location-latitude-degrees-degree')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a latitude degree')
            .run(req);
          await body('location-latitude-degrees-minute')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter latitude minutes')
            .run(req);
          await body('location-latitude-degrees-second')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter latitude seconds')
            .run(req);
          await body('location-latitude-degrees-degree')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a longitude degree')
            .run(req);
          await body('location-longitude-degrees-minute')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter longitude minutes')
            .run(req);
          await body('location-longitude-degrees-second')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter longitude seconds')
            .run(req);

          break;

        case 'what-3-words':
          session['w3w-name'] = reqBody['w3w-name'];

          await api.convertToCoordinates(session['w3w-name']).then((data) => {
            session['location-standard'].latitude = data.coordinates.lat;
            session['location-standard'].longitude = data.coordinates.lng;

            session['location-given'].latitude = `${data.coordinates.lat}° N `;
            session['location-given'].longitude = `${data.coordinates.lng}° W`;
          });

          //TODO Errors need to check if a w3w value has been made (eg. lock.spout.radar)
          await body('w3w-name')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter what3words')
            .run(req);

          break;
        case 'map':
          session['map-latitude-input'] = reqBody['map-latitude-input'];
          session['map-longitude-input'] = reqBody['map-longitude-input'];
          session['map-radius-input'] = reqBody['map-radius-input'];

          var latitude = Number.parseFloat(
            session['map-latitude-input']
          ).toFixed(5);
          var longitude = Number.parseFloat(
            session['map-longitude-input']
          ).toFixed(5);

          session['location-standard'].latitude = latitude;
          session['location-standard'].longitude = longitude;
          session['location-standard'].radius = session['map-radius-input'];

          session['location-given'].latitude = `${latitude}° N `;
          session['location-given'].longitude = `${longitude}° W`;

          await body('map-radius-input')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Draw a circle on the map')
            .run(req);

          break;
        case 'description':
          session['location-description'] = reqBody['location-description'];

          await body('location-description')
            .exists()
            .not()
            .isEmpty()
            .withMessage('Enter a description')
            .run(req);

        default:
          session['location-standard'].latitude = 0;
          session['location-standard'].longitude = 0;
          session['location-standard'].radius = 0;

          session['location-given'].latitude = '';
          session['location-given'].longitude = '';
      }
      const errors = formatValidationErrors(validationResult(req));

      if (!errors) {
        return res.redirect('depth');
      } else {
        return res.render('report/location', {
          errors,
          errorSummary: Object.values(errors),
          values: req.body
        });
      }
    }
  );
}
