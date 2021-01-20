const { body, validationResult } = require('express-validator');
import { formatValidationErrors } from '../../utils';

export default function (app) {
  app.post(
    '/report/location-answer', function (req, res) {
    // Standardise the location data so we can show it more easily later.
    const type = req.session.data.location
    
    req.session.data['location-standard'] = {}
    req.session.data['location-given'] = {}
  
    switch (type) {
      case 'coords-decimal':
        req.session.data['location-standard'].latitude = req.session.data['location-latitude-decimal']
        req.session.data['location-standard'].longitude = req.session.data['location-longitude-decimal']
        req.session.data['location-standard'].radius = 0
  
        req.session.data['location-given'].latitude = req.session.data['location-latitude-decimal'] + '°'
        req.session.data['location-given'].longitude = req.session.data['location-longitude-decimal'] + '°'
        break
      case 'coords-decimal-minutes':
        var latD = Number.parseFloat(req.session.data['location-latitude-decimal-minutes-degree'])
        var latM = Number.parseFloat(req.session.data['location-latitude-decimal-minutes-minute'])
        var latDir = req.session.data['location-latitude-decimal-minutes-direction']
        var lonD = Number.parseFloat(req.session.data['location-longitude-decimal-minutes-degree'])
        var lonM = Number.parseFloat(req.session.data['location-longitude-decimal-minutes-minute'])
        var lonDir = req.session.data['location-longitude-decimal-minutes-direction']
  
        var latitude = latD + (latM / 60)
        var longitude = lonD + (lonM / 60)
  
        if (latDir == "S") {
          latitude = latitude * -1;
        }
        if (lonDir == "W") {
          longitude = longitude * -1;
        }
  
        req.session.data['location-standard'].latitude = latitude.toFixed(5)
        req.session.data['location-standard'].longitude = longitude.toFixed(5)
        req.session.data['location-standard'].radius = 0
  
        req.session.data['location-given'].latitude = latD + '° ' + latM + "' " + latDir;
        req.session.data['location-given'].longitude = lonD + '° ' + lonM + "' " + lonDir;
        break
      case 'coords-sexagesimal':
        var latD = Number.parseFloat(req.session.data['location-latitude-degrees-degree'])
        var latM = Number.parseFloat(req.session.data['location-latitude-degrees-minute'])
        var latS = Number.parseFloat(req.session.data['location-latitude-degrees-second'])
        var latDir = req.session.data['location-latitude-degrees-direction']
        var lonD = Number.parseFloat(req.session.data['location-longitude-degrees-degree'])
        var lonM = Number.parseFloat(req.session.data['location-longitude-degrees-minute'])
        var lonS = Number.parseFloat(req.session.data['location-longitude-degrees-second'])
        var lonDir = req.session.data['location-longitude-degrees-direction']
  
        var latitude = latD + (latM / 60) + (latS / 3600)
        var longitude = lonD + (lonM / 60) + (lonS / 3600)
        var latitude = latD + (latM / 60)
        var longitude = lonD + (lonM / 60)
        
        if (latDir == "S") {
          latitude = latitude * -1;
        }
        if (lonDir == "W") {
          longitude = longitude * -1;
        }
  
  
        req.session.data['location-standard'].latitude = latitude.toFixed(5)
        req.session.data['location-standard'].longitude = longitude.toFixed(5)
        req.session.data['location-standard'].radius = 0
  
        req.session.data['location-given'].latitude = latD + '° ' + latM + "' " + latS + '" ' + latDir;
        req.session.data['location-given'].longitude = lonD + '° ' + lonM + "' " + lonS + '" ' + lonDir;
        break
      case 'map':
        var latitude = Number.parseFloat(req.session.data['map-latitude-input']).toFixed(5)
        var longitude = Number.parseFloat(req.session.data['map-longitude-input']).toFixed(5)
  
        req.session.data['location-standard'].latitude = latitude
        req.session.data['location-standard'].longitude = longitude
        req.session.data['location-standard'].radius = req.session.data['map-radius-input']
  
        req.session.data['location-given'].latitude = latitude + '° N '
        req.session.data['location-given'].longitude = longitude + '° W'
        break
      default:
        req.session.data['location-standard'].latitude = 0
        req.session.data['location-standard'].longitude = 0
        req.session.data['location-standard'].radius = 0
  
        req.session.data['location-given'].latitude = ''
        req.session.data['location-given'].longitude = ''
    }

    if (parseInt(req.session.data['location-standard'].latitude) && parseInt(req.session.data['location-standard'].longitude)) {
      return res.redirect('/report/depth');
    } else {
      console.log('error');
      return res.redirect('/report/location');
    }
  })
}
