import {$} from '../utilities/selector.js';

class ComponentManager {
  constructor(component, selector, ...args) {
    if ( ! selector || ! component ) return;

    if ( typeof selector !== "string" ) {
      throw new Error("Selector must be a string. You provided: " + typeof selector);
    }

    if ( typeof component !== "function" ) {
      throw new Error("Component must be a function (or class). You provided: " + typeof component);
    }

    this.elements = [...$(selector)];
    this.component = component;
    this.args = args;

    if ( this.elements.length ) {
      this.components = this.elements.map(this.init, this);
    }
  }

  init(el) {
    let args = this.args.map(arg => typeof arg === "function" ? arg(el) : arg);
    return new this.component(el, ...args);
  }
}

export default ComponentManager;
