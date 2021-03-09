import axios from 'axios';
import adal from 'adal-node';

import { $, $1, closest } from '../utilities/selector.js';

import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class PortalSignIn {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.signInBtn = $1('[data-js=sign-in-btn]', this.el);
    
    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    
  }

}

export default LoadManager.queue(() => {
  new ComponentManager(PortalSignIn, '[data-js~=portal-sign-in]');
}, QUEUE.DOM);
