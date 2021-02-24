import axios from 'axios';

import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

export class SpreadsheetUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;
    
    this.fileInput = $1('[data-js=file-input]', this.el);
    this.fileInputWrapper = $1('[data-js=file-input-wrapper]', this.el);
    this.spreadsheetUploadBtn = $1('[data-js=spreadsheet-upload-btn]', this.el);
    this.continueBtn = $1('[data-js=bulk-continue-btn]', this.el);

    this.errorBlock = $('.upload-error', this.el);
    this.errorText = $('.upload-error__text', this.el);

    this.uploadProgress = $1('.file-upload-progress', this.el);
    this.uploadProgressBar = $1('.file-upload-progress__bar span', this.el);
    this.uploadProgressText = $1('.file-upload-progress__text', this.el);
    this.uploadProgressPercent = $1('.file-upload-progress__percent', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    this.spreadsheetUploadEvent();
    this.fileInputListener();
  }


  spreadsheetUploadEvent() {
    this.spreadsheetUploadBtn.addEventListener('click', async () => {
      const input = this.fileInput;
      const file = new FormData();
      file.append('bulk-upload-file', input.files[0]);
      try {
        const res = await axios.post(
          `/report/property-bulk`,
          file,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          }
        );

        if (res.data.error) {
          this.errorText.forEach((i) => (i.innerText = res.data.error.text));
          this.scrollToTop();
          this.errorBlock.forEach((i) => (i.classList.remove('hidden')));
        } else {
          this.handleLoadingIndicator();
          this.errorBlock.forEach((i) => (i.classList.add('hidden')));     
          this.spreadsheetUploadBtn.classList.add('hidden');
          this.continueBtn.classList.remove('hidden');
        }
      } catch (reqError) {
        console.error(reqError);
      }
    });
  }

  fileInputListener() {
    this.fileInput.addEventListener('input', () => {
      if(this.spreadsheetUploadBtn.disabled) {
        this.spreadsheetUploadBtn.disabled = false;
        this.spreadsheetUploadBtn.classList.remove('govuk-button--disabled');
        this.spreadsheetUploadBtn.removeAttribute('aria-disabled');
      }

      if (this.continueBtn.classList.contains('hidden')) {
        return;
      } else {
        this.continueBtn.classList.add('hidden');
        this.spreadsheetUploadBtn.classList.remove('hidden');
      }
    })
  }

  scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  handleLoadingIndicator() {
    let progress = 0;
    this.fileInputWrapper.classList.add('hidden');
    this.uploadProgress.classList.add('file-upload-progress--visible');

    this.uploadProgressText.innerText = `Uploading file...`;
    const uploadStatus = setInterval(() => { 
      progress++; 
      this.uploadProgressPercent.innerText = `${progress}%`;
      this.uploadProgressBar.style.width = `${progress}%`;
      if (progress === 100) {
        this.uploadProgressText.innerText = `File uploaded`;
        this.uploadProgress.classList.remove('file-upload-progress--visible');
        this.fileInput.labels[0].innerText = 'File uploaded'
        this.fileInputWrapper.classList.remove('hidden');
        clearInterval(uploadStatus);
      }
    }, 10);
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(SpreadsheetUpload, "[data-js~=spreadsheet-upload]")
}, QUEUE.DOM)