import { $, $1, closest } from '../utilities/selector.js';

import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class StaticMap {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.mapElement = $1('#location-map', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.initialiseMap(this.mapElement);
  }

  initialiseMap(mapElement) {
    var latitude = mapElement.dataset.latitude;
    var longitude = mapElement.dataset.longitude;
    var radius = mapElement.dataset.radius;

    var map = L.map(mapElement.id).setView([latitude, longitude], 8);

    if (radius > 0) {
      L.circle([latitude, longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
      }).addTo(map);
    } else {
      L.marker([latitude, longitude]).addTo(map);
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18
    }).addTo(map);

    return map;
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(StaticMap, '[data-js~=static-map]');
}, QUEUE.DOM);
