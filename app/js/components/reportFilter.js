import { $, $1, closest } from '../utilities/selector.js';

import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class ReportFilter {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.filterItems = [...$('[data-js=portal-filter-item]', this.el)];
    this.reportListTable = $1('[data-js=report-listings-table', this.el);
    this.reportListRows = [...$('[data-js=report-listings-row]', this.reportListTable)]

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.filterSelectionEvent();
  }

  filterSelectionEvent() {
    this.filterItems.forEach((item) => {
      item.addEventListener('click', () => {
        const active = item.classList.contains('portal-filter-item--active'),
              status = item.dataset.status;
        this.clearActiveStates();

        if (!active) {
          const activeItems = [...$(`[data-status=${status}]`, this.reportListTable)];
          item.classList.add('portal-filter-item--active');
          this.reportListRows.forEach((row) => {
            row.classList.add('hidden');
          });
          activeItems.forEach((item) => {
            item.classList.remove('hidden');
            item.classList.add('visible');
          })
        } else {
          this.displayAllRows();
        }
      });
    });
  }

  clearActiveStates() {
    this.filterItems.forEach((item) => {
      item.classList.remove('portal-filter-item--active');
    })
  }

  displayAllRows() {
    this.reportListRows.forEach((row) => {
      if(row.classList.contains('hidden')) {
        row.classList.remove('hidden');
      }
      row.classList.add('visible');
    })
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(ReportFilter, '[data-js~=portal-filter]');
}, QUEUE.DOM);
