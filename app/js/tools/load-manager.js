export const QUEUE = {
  DOM: "DOM",
  RESOURCES: "RESOURCES"
};

class LoadManager {
  events = {
    [QUEUE.DOM]: [],
    [QUEUE.RESOURCES]: []
  }

  loaded = {
    [QUEUE.DOM]: false,
    [QUEUE.RESOURCES]: false
  }

  constructor() {
    this.bind();
  }

  bind() {
    this.runDomQueue = this.run.bind(this, QUEUE.DOM);
    this.runResourceQueue = this.run.bind(this, QUEUE.RESOURCES);
    document.addEventListener("DOMContentLoaded", this.runDomQueue);
    window.addEventListener("load", this.runResourceQueue);
  }

  unbind(queue) {
    switch (queue) {
      case QUEUE.DOM:
        document.removeEventListener("DOMContentLoaded", this.runDomQueue);
        break;

      case QUEUE.RESOURCES:
        window.removeEventListener("load", this.runResourceQueue);
    }
  }

  queue(func, queue) {
    if (typeof func !== 'function') {
      throw new Error('Event must be a function');
    }

    if (typeof queue === "undefined") {
      throw new Error("Load Queue must be defined");
    }

    if (
      typeof this.loaded[queue] !== "boolean" ||
      (typeof this.loaded[queue] !== "undefined" && !Array.isArray(this.events[queue]))
    ) {
      throw new Error("Load Queue type does not exist");
    }

    this.events[queue].push(func);
    if (this.loaded[queue]) {
      func()
    }
  }

  run = (queue, e) => {
    this.loaded[queue] = true;

    this.events[queue].forEach(evt => evt());

    this.unbind(queue);
  }
}

export default new LoadManager();
