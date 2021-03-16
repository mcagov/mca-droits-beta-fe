import { $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class PortalSort {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.select = $1('#report-sort-by', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.selectOnChange();
  }
  selectOnChange() {
    this.select.addEventListener('change', () => {
      this.el.submit();
    });
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(PortalSort, '[data-js~=portal-sort]');
}, QUEUE.DOM);
