import { $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class ActionConfirmation {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.closeBtn = $1('[data-js=close-btn]', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.handleCloseEvent();
  }

  handleCloseEvent() {
    this.closeBtn.addEventListener('click', () => {
      this.el.classList.add('fade-out');
    });
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(ActionConfirmation, '[data-js~=action-confirmation]');
}, QUEUE.DOM);