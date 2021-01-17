import { $, $1, closest } from "Utilities/selector";

import ComponentManager from "Tools/component-manager";
import LoadManager, { QUEUE } from "Tools/load-manager";

/*
    HOW THIS COMPONENT WORKS
    Please add a quick summary describing the purpose of this JS component
    This helps with future developments on the component
    bonus points for including comments especially for complex functions
*/

export class Map {
  constructor(el) {
    if (!el) return;

    this.el = el;

    // Example of single element selector, behaves like querySelector
    this.elementOne = $1("[data-js~=example-elementOne]", this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    this.initEditableMap();
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
  
    // map.on(L.Draw.Event.EDITSTART, function (e) {
    //   window.dontLeaveWhenEditing = (event) => {
    //     event.preventDefault()
    //     event.returnValue = ''
    //   }
  
    //   window.addEventListener('beforeunload', window.dontLeaveWhenEditing)
    // })
  
    map.on(L.Draw.Event.EDITED, function (e) {
      // window.removeEventListener('beforeunload', window.dontLeaveWhenEditing)
  
      e.layers.eachLayer(function (layer) {
        latitudeInput.value = layer.getLatLng().lat
        longitudeInput.value = layer.getLatLng().lng
        radiusInput.value = layer.getRadius()
      })
    })
  
    // map.on(L.Draw.Event.DELETESTART, function (e) {
    //   window.dontLeaveWhenEditing = (event) => {
    //     event.preventDefault()
    //     event.returnValue = ''
    //   }
  
    //   // window.addEventListener('beforeunload', window.dontLeaveWhenEditing)
    // })
  
    map.on(L.Draw.Event.DELETED, function (e) {
      if (editableLayers.getLayers().length === 0) {
        map.removeControl(drawControlEditOnly)
        map.addControl(drawControlFull)
  
        latitudeInput.value = ''
        longitudeInput.value = ''
        radiusInput.value = ''
      }
      // window.removeEventListener('beforeunload', window.dontLeaveWhenEditing)
    })
  
    return map
  }

}

export default LoadManager.queue(() => {
  new ComponentManager(Map, "[data-js~=map]")
}, QUEUE.DOM)
