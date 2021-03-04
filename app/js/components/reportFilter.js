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
    this.allTag = $1('[data-status=all]', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.filterSelectionEvent();
  }

  filterSelectionEvent() {
    this.filterItems.forEach((item) => {
      item.addEventListener('click', () => {
        const isActive = item.classList.contains('portal-filter-item--active'),
              status = item.dataset.status;

        if(isActive && status === 'all') {
          this.handleFilter(item, isActive, status);
        } else if (isActive && status !== 'all') {
          this.setDefaultStatus();
          this.handleFilter(item, isActive, status);
        } else {
          this.clearActiveStatuses();
          this.handleFilter(item, isActive, status);
        }
      });
    });
  }

  handleFilter(reportItem, activeState, filterStatus) {
    if (!activeState) {
      if(filterStatus === 'all') {
        reportItem.classList.add('portal-filter-item--active');
        this.displayAllRows();
        return;
      }
      const activeItems = [...$(`[data-status=${filterStatus}]`, this.reportListTable)];
      reportItem.classList.add('portal-filter-item--active');
      this.reportListRows.forEach((row) => {
        row.classList.remove('visible');
        row.classList.add('hidden');
      });
      activeItems.forEach((item) => {
        item.classList.remove('hidden');
        item.classList.add('visible');
      })
    } else {
      this.displayAllRows();
    }
  }

  clearActiveStatuses() {
    this.filterItems.forEach((item) => {
      item.classList.remove('portal-filter-item--active');
    })
  }

  setDefaultStatus() {
    this.filterItems.forEach((item) => {
      item.classList.remove('portal-filter-item--active');
      this.allTag.classList.add('portal-filter-item--active');
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
