const { body, validationResult } = require('express-validator');
import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/location-answer',
    body('location-type')
      .exists()
      .not()
      .isEmpty()
      .withMessage('Choose an option'),
    async (req, res, next) => {
      if (req.body['location-type']) {
        // ReferenceError: Cannot access 'body' before initialization
        await body('coords-decimal')
          .exists()
          .not()
          .isEmpty()
          .withMessage('Choose an option');
      }

      const errors = await formatValidationErrors(validationResult(req));
      const session = req.session.data.location;
      const body = req.body;
      const type = body['location-type'];

      session['location-type'] = type;

      if (!errors) {
        switch (type) {
          case 'coords-decimal':
            session['location-latitude-decimal'] =
              body['location-latitude-decimal'];
            session['location-longitude-decimal'] =
              body['location-longitude-decimal'];

            session['location-standard'].latitude =
              body['location-latitude-decimal'];
            session['location-standard'].longitude =
              body['location-longitude-decimal'];
            session['location-standard'].radius = 0;

            session[
              'location-given'
            ].latitude = `${session['location-standard'].latitude}°`;
            session[
              'location-given'
            ].longitude = `${session['location-standard'].longitude}°`;

            break;
          case 'coords-decimal-minutes':
            session['location-latitude-decimal-minutes-degree'] =
              body['location-latitude-decimal-minutes-degree'];
            session['location-latitude-decimal-minutes-minute'] =
              body['location-latitude-decimal-minutes-minute'];
            session['location-latitude-decimal-minutes-direction'] =
              body['location-latitude-decimal-minutes-direction'];
            session['location-longitude-decimal-minutes-degree'] =
              body['location-longitude-decimal-minutes-degree'];
            session['location-longitude-decimal-minutes-minute'] =
              body['location-longitude-decimal-minutes-minute'];
            session['location-longitude-decimal-minutes-direction'] =
              body['location-longitude-decimal-minutes-direction'];

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
            var lonDir =
              session['location-longitude-decimal-minutes-direction'];

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
            session['location-latitude-degrees-degree'] =
              body['location-latitude-degrees-degree'];
            session['location-latitude-degrees-minute'] =
              body['location-latitude-degrees-minute'];
            session['location-latitude-degrees-second'] =
              body['location-latitude-degrees-second'];
            session['location-latitude-degrees-direction'] =
              body['location-latitude-degrees-direction'];
            session['location-longitude-degrees-degree'] =
              body['location-longitude-degrees-degree'];
            session['location-longitude-degrees-minute'] =
              body['location-longitude-degrees-minute'];
            session['location-longitude-degrees-second'] =
              body['location-longitude-degrees-second'];
            session['location-longitude-degrees-direction'] =
              body['location-longitude-degrees-direction'];

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
          case 'what-3-words':
            session['3wa'] = body['3wa'];
            break;
          case 'map':
            session['map-latitude-input'] = body['map-latitude-input'];
            session['map-longitude-input'] = body['map-longitude-input'];
            session['map-radius-input'] = body['map-radius-input'];

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
          case 'description':
            session['location-description'] = body['location-description'];

          default:
            session['location-standard'].latitude = 0;
            session['location-standard'].longitude = 0;
            session['location-standard'].radius = 0;

            session['location-given'].latitude = '';
            session['location-given'].longitude = '';
        }
        // console.log(body);
        // console.log(session);
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
