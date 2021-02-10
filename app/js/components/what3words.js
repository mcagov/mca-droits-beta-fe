import { $, $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';
import w3wAutocomplete from './w3w-autocomplete/wrapper.js';

export class What3Words {
  constructor(el) {
    if (!el) return;

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    w3wAutocomplete({
      element: document.querySelector('#w3w-autocomplete'),
      id: 'w3w-name',
      name: 'w3w-name',
      required: true,
      source: this.fetchData,
      defaultValue: document.getElementById('w3w-autocomplete').dataset.value
    });
  }
}
export default LoadManager.queue(() => {
  new ComponentManager(What3Words, '[data-js~=w3w]');
}, QUEUE.DOM);
