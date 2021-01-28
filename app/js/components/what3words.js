import { $, $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class What3Words {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.input = $1('#w3w-name', this.el);
    this.autoSuggest = $1('#w3w__listbox', this.el);
    this.autoSuggestOption = $1('.autocomplete__option');

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    var self = this;
    //TODO Need to add accessibility to this component
    this.input.addEventListener('keyup', (e) => {
      what3words.api.autosuggest(e.target.value).then(function (res) {
        self.autoSuggest.innerHTML = null;

        if (res.suggestions.length) {
          self.toggleAutosuggest('show');
        } else {
          self.toggleAutosuggest('hide');
        }

        res.suggestions.map((i, index) => {
          self.autoSuggest.innerHTML += `<li class="autocomplete__option" id="wreck-name__option--${index}" role="option" tabindex="0"><span class="govuk-body govuk-!-font-size-19 govuk-!-font-weight-bold">${i.words}</span><br/><span class="govuk-body govuk-!-font-size-14">${i.nearestPlace}</span></li>`;
        });

        $('.autocomplete__option').forEach((el) =>
          el.addEventListener('click', (e) => {
            const w3wName = e.target.childNodes[0].innerText;

            self.input.value = w3wName;
            self.toggleAutosuggest('hide');
          })
        );
      });
    });
  }
  toggleAutosuggest(type) {
    const classes = this.autoSuggest.classList;

    if (type === 'show') {
      classes.remove('autocomplete__menu--hidden');
      classes.add('autocomplete__menu--visible');
    } else if (type === 'hide') {
      classes.remove('autocomplete__menu--visible');
      classes.add('autocomplete__menu--hidden');
    }
  }
}
export default LoadManager.queue(() => {
  new ComponentManager(What3Words, '[data-js~=w3w]');
}, QUEUE.DOM);
