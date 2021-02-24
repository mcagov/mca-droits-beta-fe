import axios from 'axios';

import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

export class SpreadsheetUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;
    
    this.fileInput = $1('[data-js=file-input]', this.el);
    this.spreadsheetUploadBtn = $1('[data-js=spreadsheet-upload-btn]', this.el);
    this.continueBtn = $1('[data-js=bulk-continue-btn]', this.el);

    this.errorBlock = $('.upload-error', this.el);
    this.errorText = $('.upload-error__text', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    console.log('spreadsheet upload script');
    this.singleUploadEvent();
  }


  singleUploadEvent() {
    this.spreadsheetUploadBtn.addEventListener('click', async () => {
      console.log('click');
      const input = this.fileInput;
      const file = new FormData();
      file.append('bulk-upload-file', input.files[0]);
      try {
        const res = await axios.post(
          `/report/property-bulk`,
          file,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          }
        );

        if (res.data.error) {
          this.errorText.forEach((i) => (i.innerText = res.data.error.text));
          this.scrollToTop();
          this.errorBlock.forEach((i) => (i.classList.remove('hidden')));
        } else {
          this.errorBlock.forEach((i) => (i.classList.add('hidden')));     
          this.spreadsheetUploadBtn.classList.add('hidden');
          this.continueBtn.classList.remove('hidden');
        }
      } catch (reqError) {
        console.error(reqError);
      }
    });
  }

  scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(SpreadsheetUpload, "[data-js~=spreadsheet-upload]")
}, QUEUE.DOM)