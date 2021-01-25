import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

import axios from "axios";
import accessibleAutocomplete from "accessible-autocomplete";

export class VesselInformation {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.data = {};

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    this.initAutocomplete()
  }

  initAutocomplete() {
    accessibleAutocomplete({
      element: document.querySelector('#wreck-name-autocomplete'),
      id: 'wreck-name',
      name: 'wreck-name',
      required: true,
      showNoOptionsFound: false,
      source: this.customSuggest,
      defaultValue: document.getElementById('wreck-name-autocomplete').dataset.value,
      templates: {
        inputValue: this.inputValueTemplate,
        suggestion: this.suggestionTemplate
      },
      onConfirm: (val) => {
        if (val && val.constructed) {
          document.getElementById('wreck-construction-year').value = val.constructed
        }

        if (val && val.sunk) {
          document.getElementById('wreck-sunk-year').value = val.sunk
        }
      }
    })
  }

  inputValueTemplate (result) {
    return result && result.name
  }

  suggestionTemplate (result) {
    return result && result.name +
      ' (<span>' + result.constructed + '-' + result.sunk + '</span>)'
  }

  fetchData() {
    const url = "https://datahub.admiralty.co.uk/server/rest/services/Hosted/INSPIRE_Wrecks_Points/FeatureServer/0/query?where=1%3D1&outFields=latitude,longitude,objnam,globalid&returnGeometry=false&outSR=4326&f=json";

    axios.get(url)
    .then((resp) => {
        if(resp.data) {
          console.log(resp.data);
          return resp.data.features;
        }
    })
    .catch((err) => {
        console.log(err);
    })
  }

  customSuggest (query, syncResults) {
    // 'this' returns undefined inside this function (??)
    // var results = this.data;

    syncResults(query
      ? results.filter(function (result) {
        if (result.attributes.objnam) {
          return result.attributes.objnam.toLowerCase().indexOf(query.toLowerCase()) !== -1
        }
      })
      : []
    )
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(VesselInformation, "[data-js~=vessel-information]")
}, QUEUE.DOM)
