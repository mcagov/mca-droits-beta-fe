import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

export class EditableMap {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.locationMapInput = $1('#location-map-input', this.el);

    this.latitude = $1('#map-latitude-input');
    this.longitude = $1('#map-longitude-input');
    this.radius = $1('#map-radius-input');

    this.locationRadios = [...$('input[type=\'radio\'][name=\'location-type\']')];

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    var map = this.initEditableMap(this.locationMapInput, this.latitude, this.longitude, this.radius)

    // When the radios open, invalidate the map size so Leaflet re-renders the map.
    this.locationRadios.forEach(el => {
      el.addEventListener('click', function() {
      // Small timeout required to allow for radio button click before map is re-rendered
      setTimeout(function(){ map.invalidateSize()}, 10);
      })
    })
  }

  initEditableMap (mapID, latitudeInput, longitudeInput, radiusInput) {
    var map = L.map(mapID).setView([54.6, -4.3], 5)
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18
    }).addTo(map)
  
    var editableLayers = new L.FeatureGroup()
    map.addLayer(editableLayers)
  
    var drawControlFull = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: false,
        polygon: false,
        rectangle: false,
        circle: {},
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: editableLayers
      }
    })
  
    var drawControlEditOnly = new L.Control.Draw({
      position: 'topright',
      draw: false,
      edit: {
        featureGroup: editableLayers
      }
    })
  
    map.addControl(drawControlFull)
  
    if (latitudeInput.value && longitudeInput.value && radiusInput.value) {
      var circle = L.circle([latitudeInput.value, longitudeInput.value], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.25,
        radius: radiusInput.value
      }).addTo(editableLayers)
  
      map.setView([latitudeInput.value, longitudeInput.value], 10)
  
      map.removeControl(drawControlFull)
      map.addControl(drawControlEditOnly)
    }
  
    map.on(L.Draw.Event.CREATED, function (e) {
      var layer = e.layer
  
      layer.addTo(editableLayers)
  
      latitudeInput.value = layer.getLatLng().lat
      longitudeInput.value = layer.getLatLng().lng
      radiusInput.value = layer.getRadius()
  
      map.removeControl(drawControlFull)
      map.addControl(drawControlEditOnly)
    })
  
    map.on(L.Draw.Event.EDITED, function (e) {
  
      e.layers.eachLayer(function (layer) {
        latitudeInput.value = layer.getLatLng().lat
        longitudeInput.value = layer.getLatLng().lng
        radiusInput.value = layer.getRadius()
      })
    })
  
    map.on(L.Draw.Event.DELETED, function (e) {
      if (editableLayers.getLayers().length === 0) {
        map.removeControl(drawControlEditOnly)
        map.addControl(drawControlFull)
  
        latitudeInput.value = ''
        longitudeInput.value = ''
        radiusInput.value = ''
      }
    })
    
    return map;
  }

}

export default LoadManager.queue(() => {
  new ComponentManager(EditableMap, "[data-js~=editable-map]")
}, QUEUE.DOM)
