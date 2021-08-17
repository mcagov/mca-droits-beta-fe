import { body, validationResult } from 'express-validator';
import { formatValidationErrors } from '../../../utilities';
import GT_OSGB from '../../../utilities';

const inRange = require('lodash.inrange');
const latitudeDegressRange = (val) => inRange(val, -90, 90) || val == 90;
const longitudeDegressRange = (val) => inRange(val, -180, 180) || val == 180;
const minutesSecondsRange = (val) => inRange(val, 0, 60) || val == 60;

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
      let errors;
      let errorSummary;

      session['location-standard'] = {};
      session['location-given'] = {};

      const type = reqBody['location-type'];

      session['location-type'] = type;

      session['location-description'] = reqBody['location-description'];

      switch (type) {
        case 'coords-decimal':
          session['location-type'] = 'coords-decimal';
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

          await body('location-latitude-decimal')
            .exists()
            .escape()
            .custom((val) => {
              if (!latitudeDegressRange(val)) {
                throw new Error('Enter a latitude between -90 and 90');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter a latitude')
            .run(req);
          await body('location-longitude-decimal')
            .exists()
            .escape()
            .custom((val) => {
              if (!longitudeDegressRange(val)) {
                throw new Error('Enter a longitude between -180 and 180');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter a longitude')
            .run(req);

          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);

          break;

        case 'coords-decimal-minutes':
          // handle errors
          await body('location-latitude-decimal-minutes-degree')
            .exists()
            .escape()
            .custom((val) => {
              if (!latitudeDegressRange(val)) {
                throw new Error('Enter a latitude degree between -90 and 90');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter a latitude degree')
            .run(req);
          await body('location-latitude-decimal-minutes-minute')
            .exists()
            .escape()
            .custom((val) => {
              if (!minutesSecondsRange(val)) {
                throw new Error('Enter latitude minutes between 0 and 60');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter latitude minutes')
            .run(req);
          await body('location-longitude-decimal-minutes-degree')
            .exists()
            .escape()
            .custom((val) => {
              if (!latitudeDegressRange(val)) {
                throw new Error(
                  'Enter a longitude degree between -180 and 180'
                );
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter a longitude degree')
            .run(req);
          await body('location-longitude-decimal-minutes-minute')
            .exists()
            .escape()
            .custom((val) => {
              if (!minutesSecondsRange(val)) {
                throw new Error('Enter longitude minutes between 0 and 60');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter longitude minutes')
            .run(req);

          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);

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

          break;
        case 'coords-sexagesimal':
          // handle errors
          await body('location-latitude-degrees-degree')
            .exists()
            .escape()
            .custom((val) => {
              if (!latitudeDegressRange(val)) {
                throw new Error('Enter a latitude degree between -90 and 90');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter a latitude degree')
            .run(req);
          await body('location-latitude-degrees-minute')
            .exists()
            .escape()
            .custom((val) => {
              if (!minutesSecondsRange(val)) {
                throw new Error('Enter latitude minutes between 0 and 60');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter latitude minutes')
            .run(req);
          await body('location-latitude-degrees-second')
            .exists()
            .escape()
            .custom((val) => {
              if (!minutesSecondsRange(val)) {
                throw new Error('Enter latitude seconds between 0 and 60');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter longitude seconds')
            .run(req);
          await body('location-longitude-degrees-degree')
            .exists()
            .escape()
            .custom((val) => {
              if (!latitudeDegressRange(val)) {
                throw new Error(
                  'Enter a longitude degree between -180 and 180'
                );
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter a longitude degree')
            .run(req);
          await body('location-longitude-degrees-minute')
            .exists()
            .escape()
            .custom((val) => {
              if (!minutesSecondsRange(val)) {
                throw new Error('Enter longitude minutes between 0 and 60');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter longitude minutes')
            .run(req);
          await body('location-longitude-degrees-second')
            .exists()
            .escape()
            .custom((val) => {
              if (!minutesSecondsRange(val)) {
                throw new Error('Enter longitude seconds between 0 and 60');
              }
              return true;
            })
            .isNumeric()
            .withMessage('Enter a number')
            .not()
            .isEmpty()
            .withMessage('Enter longitude seconds')
            .run(req);

          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);

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

          break;

        case 'coords-osgrid':
          await body('location-osgrid-square')
            .exists()
            .escape()
            .not()
            .isNumeric()
            .withMessage('Grid reference must be letters')
            .not()
            .isEmpty()
            .withMessage('Enter grid reference')
            .run(req);
          await body('location-osgrid-easting')
            .exists()
            .escape()
            .isNumeric()
            .withMessage('Must be a number')
            .not()
            .isEmpty()
            .withMessage('Enter easting')
            .run(req);
          await body('location-osgrid-northing')
            .exists()
            .escape()
            .isNumeric()
            .withMessage('Must be a number')
            .not()
            .isEmpty()
            .withMessage('Enter northing')
            .run(req);

          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);

          session['location-osgrid-square'] = reqBody['location-osgrid-square'];
          session['location-osgrid-easting'] =
            reqBody['location-osgrid-easting'];
          session['location-osgrid-northing'] =
            reqBody['location-osgrid-northing'];

          const osgb = new GT_OSGB();

          osgb.parseGridRef(
            `${reqBody['location-osgrid-square']} ${reqBody['location-osgrid-easting']} ${reqBody['location-osgrid-northing']}`
          );

          const wgs84 = osgb.getWGS84();

          session['location-standard'].latitude = wgs84.latitude.toFixed(5);
          session['location-standard'].longitude = wgs84.longitude.toFixed(5);
          session['location-standard'].radius = 0;

          session[
            'location-given'
          ].latitude = `${session['location-standard'].latitude}°`;
          session[
            'location-given'
          ].longitude = `${session['location-standard'].longitude}°`;

          break;

        case 'map':
          await body('map-radius-input')
            .exists()
            .escape()
            .not()
            .isEmpty()
            .withMessage('Draw a circle on the map')
            .run(req);

          await body('map-latitude-input')
            .escape()
            .run(req);

          await body('map-radius-input')
            .escape()
            .run(req);

          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);
          if (errors) {
            errorSummary[0].id = 'location-map-input';
            errorSummary[0].href = '#location-map-input';
            errors['location-map-input'] = {
              id: 'location-map-input',
              href: '#location-map-input',
              text: 'Draw the area of the find on the map'
            };
          }

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

          break;

        case 'text-location':
          await body('text-location')
            .exists()
            .escape()
            .not()
            .isEmpty()
            .withMessage('Please enter a detailed description of the location')
            .run(req);

          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);
          if (errors) {
            errorSummary[0].id = 'text-location';
            errorSummary[0].href = '#text-location';
            errors['text-location'] = {
              id: 'text-location',
              href: '#text-location',
              text: 'Please enter a detailed description of the location'
            };
          }

          session['location-standard'].latitude = null;
          session['location-standard'].longitude = null;
          session['location-standard'].radius = null;

          session['location-given'].latitude = null;
          session['location-given'].longitude = null;

          session['text-location'] = reqBody['text-location'];

          break;

        default:
          errors = formatValidationErrors(validationResult(req));
          errorSummary = Object.values(errors);

          break;
      }

      session['location-standard'].latitude = parseFloat(
        session['location-standard'].latitude
      );
      session['location-standard'].longitude = parseFloat(
        session['location-standard'].longitude
      );
      session['location-standard'].radius = parseInt(
        session['location-standard'].radius
      );

      if (!errors) {
        return req.session.data.redirectToCheckAnswers
          ? res.redirect('/report/check-your-answers')
          : res.redirect('depth');
      } else {
        return res.render('report/location', {
          errors,
          errorSummary,
          values: req.body
        });
      }
    }
  );
}
