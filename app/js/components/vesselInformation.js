import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

import accessibleAutocomplete from "accessible-autocomplete";

export class VesselInformation {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.example = $1('example', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    this.initAutocomplete();
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

  customSuggest (query, syncResults) {
    var params = {};
    $.ajax({
        url: "https://admiraltyapi.azure-api.net/uk_wrecks/v1/wms?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","{subscription key}");
        },
        type: "GET",
        // Request body
        data: "{body}",
      })
      .done(function(data) {
          alert("success");
      })
      .fail(function() {
          alert("error");
      });
      
    /*var results = [
      { name: 'Moldavia', constructed: '1903', sunk: '1918' },
      { name: 'HMS Vanguard', constructed: '1909', sunk: '1917' },
      { name: 'HMS London', constructed: '1663', sunk: '1665' },
      { name: 'HMS Drake', constructed: '1901', sunk: '1917' },
      { name: 'Normanby Hall', constructed: '1943', sunk: '1965' },
      { name: 'MV Princess Victoria', constructed: '1947', sunk: '1953' },
      { name: 'Avondale Park', constructed: '1944', sunk: '1945' },
      { name: 'MV Cemfjord', constructed: '1984', sunk: '2015' },
      { name: 'HMS Dasher', constructed: '1941', sunk: '1943' },
      { name: 'El Gran Grifón', constructed: '', sunk: '1588' },
      { name: 'SS John Randolph', constructed: '1905', sunk: '1952' },
      { name: 'Orion', constructed: '1847', sunk: '1850' },
      { name: 'Faraday', constructed: '1923', sunk: '1941' },
      { name: 'Pacific', constructed: '1849', sunk: '1856' },
      { name: 'Abana', constructed: '1874', sunk: '1894' },
      { name: 'MV Nyon', constructed: '1952', sunk: '1962' },
      { name: 'HMS Newcastle', constructed: '1653', sunk: '1703' },
      { name: 'SS Mendi', constructed: '1905', sunk: '1917' }
    ]
    syncResults(query
      ? results.filter(function (result) {
        return result.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
      })
      : []
    )*/
  }

}

export default LoadManager.queue(() => {
  new ComponentManager(VesselInformation, "[data-js~=vessel-information]")
}, QUEUE.DOM)
