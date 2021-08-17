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
    this.drawCircle;
    this.drawEdit;
    this.drawRemove;

    this.locationRadios = [...$('input[type=\'radio\'][name=\'location-type\']')];

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    var map = this.initEditableMap(this.locationMapInput, this.latitude, this.longitude, this.radius);
    this.manageAccessibility();
    // When the radios open, invalidate the map size so Leaflet re-renders the map.
    this.locationRadios.forEach(el => {
      el.addEventListener('click', function () {
        // Small timeout required to allow for radio button click before map is re-rendered
        setTimeout(function () { map.invalidateSize() }, 10);
      })
    })
  }

  initEditableMap(mapID, latitudeInput, longitudeInput, radiusInput) {
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

  manageAccessibility() {
    this.drawToolbars = [...$('.leaflet-draw-toolbar', this.el)];
    this.drawCircle = $1('.leaflet-draw-draw-circle', this.el);
    this.drawEdit = $1('.leaflet-draw-edit-edit', this.el);
    this.drawRemove = $1('.leaflet-draw-edit-remove', this.el);

    if(this.drawCircle)
    {
      this.drawCircle.setAttribute('aria-label', 'Draw a circle on the map to indicate an area.');
      this.drawCircle.innerHTML = '<span class="govuk-visually-hidden">Draw a circle on the map to indicate an area.</span>';
    }

    this.drawEdit.setAttribute('aria-label', 'Edit an existing circle, e.g. to move it or change its radius.');
    this.drawEdit.setAttribute('aria-disabled', 'true');
    this.drawEdit.innerHTML = '<span class="govuk-visually-hidden">Edit an existing circle, e.g. to move it or change its radius.</span>';

    this.drawRemove.setAttribute('aria-label', 'Delete a circle, to start again.');
    this.drawRemove.setAttribute('aria-disabled', 'true');
    this.drawRemove.innerHTML = '<span class="govuk-visually-hidden">Delete a circle, to start again.</span>';

    const controls = [this.drawCircle, this.drawEdit, this.drawRemove];

    controls.forEach((element) => {
      element.setAttribute('role', 'button');
    });

    // Observes DOM mutations within the leaflet-draw-toolbar and 
    // reapplies accessibility tags when the leaflet map reloads the toolbar
    this.reapplyAccessibilityAttributes();
  }

  reapplyAccessibilityAttributes() {
    const observer = new MutationObserver(function (e) {
      this.drawEdit = $1('.leaflet-draw-edit-edit', this.el);
      this.drawRemove = $1('.leaflet-draw-edit-remove', this.el);

      this.drawEdit.setAttribute('aria-disabled', 'false');
      this.drawEdit.setAttribute('role', 'button');
      this.drawEdit.setAttribute('aria-label', 'Edit an existing circle, e.g. to move it or change its radius.');

      this.drawRemove.setAttribute('aria-disabled', 'false');
      this.drawRemove.setAttribute('role', 'button');
      this.drawRemove.setAttribute('aria-label', 'Delete a circle, to start again.');
    });

    observer.observe(this.drawToolbars[1], { attributes: true, subtree: true });
  }

}

export default LoadManager.queue(() => {
  new ComponentManager(EditableMap, "[data-js~=editable-map]")
}, QUEUE.DOM)
