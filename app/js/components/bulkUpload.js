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

      // Loop through each file-upload input and grab the selected file data,
      // and the input id (which is the unique id for the wreck item)
      this.photoUploadInputs.forEach((input) => {
        let file = input.files;
        if (file.length > 0) {

          formData.append(file, file.name);
          formData.append('IDs', input.id);
        }
      });

      axios.post(
        // Post route handled in routes/property-form-image-upload.js
        `/report/property-bulk-image-upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      )
      .then((response) => {
        // Allow user to continue through form when images have uploaded
        this.removeDisabledState();
      })
      .catch((error) => {
        console.error(error);
      })

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