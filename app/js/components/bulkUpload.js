import axios from 'axios';

import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

export class BulkUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;
    this.form = $1('[data-js=bulk-form-element]', this.el);
    this.photoUploadInputs = [...$('.photo-upload__upload')];
    this.uploadButton = $1('.photo-upload__button', this.el);
    this.addButton = $1('[data-js=bulk-add-btn]', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    this.uploadEvent();
  }

  uploadEvent() {
    this.uploadButton.addEventListener('click', async () => {
      let formData = new FormData(this.form);

      this.photoUploadInputs.forEach((input) => {
        let file = input.files;
        if (file.length > 0) {

          formData.append(file, file.name);
          formData.append('IDs', input.id);
        }
      });

      try {
        const res = await axios.post(
          `/report/property-bulk-upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          }
        );
        this.removeDisabledState();
      } catch (err) {
        console.error(err);
      }

    }); 
  }

  removeDisabledState() {
    this.addButton.disabled = false;
    this.addButton.classList.remove('govuk-button--disabled');
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(BulkUpload, "[data-js~=bulk-upload]")
}, QUEUE.DOM)