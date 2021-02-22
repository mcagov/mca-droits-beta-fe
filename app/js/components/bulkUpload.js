import axios from 'axios';

import { $, $1, closest } from "../utilities/selector.js";

import ComponentManager from "../tools/component-manager.js";
import LoadManager, { QUEUE } from "../tools/load-manager.js";

export class BulkUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;
    this.id;
    this.form = $1('[data-js=bulk-form-element]', this.el);
    this.photoUploadInputs = [...$('.photo-upload__upload')];
    this.containersUploaded = [...$('.photo-upload__container--uploaded', this.el)];
    this.photoResults = [...$('.photo-upload__result', this.el)];
    this.replaceImageButtons = [...$('.photo-upload__button-change', this.el)];
    this.errorBlock = $('.upload-error', this.el);
    this.errorText = $('.upload-error__text', this.el);
    this.uploadButton = $1('.photo-upload__button', this.el);
    this.addButton = $1('[data-js=bulk-add-btn]', this.el);
    this.chosenFiles = 0;

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {

    this.handleUploadState()
    this.uploadEvent();
    this.selectAltImageEvent();
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
      .then((res) => {
        if (res.data.error) {
          this.errorText.forEach((i) => (i.innerText = res.data.error.text));
          this.scrollToTop();
          this.errorBlock.forEach((i) => (i.style.display = 'block'));
        } else {
          const data = res.data;
          this.photoResults.forEach((item, index) => {
            console.log(item.filename);
            item.src = `/uploads/${data[index]['filename']}`;
            this.containersUploaded[index].classList.remove(
              'photo-upload__container--hide'
            );
          })

          console.log(res.data);
          // Allow user to continue through form when images have uploaded
          this.removeDisabledState();
        }
      })
      .catch((error) => {
        console.error(error);
      })

    }); 
  }

  handleUploadState() {
    this.photoUploadInputs.forEach((element) => {
      element.addEventListener('input', () => {
        this.chosenFiles++;
        console.log(this.chosenFiles);
        if (this.chosenFiles === this.photoUploadInputs.length) {
          this.uploadButton.classList.remove('govuk-button--disabled');
          this.uploadButton.disabled = false;
        }
      })
    })
  }

  selectAltImageEvent() {
    this.replaceImageButtons.forEach((el) => {
      el.addEventListener('click', async () => {
        this.id = el.dataset.id;
        try {
          const res = await axios.post(
            `/report/property-form-image-delete/${this.id}`
          );
          if (res) {
            const currentUploadedContainer = el.closest('.photo-upload__container--uploaded');
            const currentUploadInput = $1(`#${this.id}`, this.el);

            currentUploadedContainer.classList.add('photo-upload__container--hide');
            currentUploadInput.value = '';
            this.continueButton.classList.add('govuk-button--disabled');
            this.continueButton.disabled = true;
          }
        } catch (err) {
          console.error(err);
        }
      });
    })
  }

  removeDisabledState() {
    this.addButton.disabled = false;
    this.addButton.classList.remove('govuk-button--disabled');
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(BulkUpload, "[data-js~=bulk-upload]")
}, QUEUE.DOM)