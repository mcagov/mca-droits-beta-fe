import { $, $1, closest } from '../utilities/selector.js';

import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class ConditionalContent {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.items = [...$('[data-js~=toggleCheck]', this.el)];
    this.togglers = [...$('[data-js~=toggler]', this.el)];
    this.hiddenContent = $1('[data-js~=hidden-content]', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    console.log(this.items);
    this.items.forEach((item) => {
      item.addEventListener('click', (e) => {
        console.log(e.currentTarget.dataset);
        const target = e.currentTarget;
        if (target.dataset.js.includes('toggler')) {
          console.log('toggler');
          if (!this.hiddenContent.classList.contains('hidden')) {
            this.hiddenContent.classList.add('hidden');
          }
        } else {
          console.log('not toggler');
          if (!this.hiddenContent.classList.contains('hidden')) {
            console.log('click - hidden found');
            this.hiddenContent.classList.add('hidden');
          }
        }
      })
    })
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(ConditionalContent, '[data-js~=conditional-content]');
}, QUEUE.DOM);
