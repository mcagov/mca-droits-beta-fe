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
    this.containersInitial = [...$('.photo-upload__container--initial', this.el)];
    this.containersUploaded = [...$('.photo-upload__container--uploaded', this.el)];
    this.photoResults = [...$('.photo-upload__result', this.el)];
    this.replaceImageButtons = [...$('.photo-upload__button-change', this.el)];
    this.bulkImageUploadButton = $1('[data-js=bulk-image-upload]', this.el);
    this.singleUploadButtons = [...$('[data-js=single-image-upload]', this.el)];
    this.addButton = $1('[data-js=bulk-add-btn]', this.el);

    this.uploadProgress = $1('.upload-progress', this.el);
    this.uploadProgressBar = $1('.upload-progress__bar span', this.el);
    this.uploadProgressText = $1('.upload-progress__text', this.el);
    this.uploadProgressPercent = $1('.upload-progress__percent', this.el);

    this.errorSummaryBlock = $1('#error-summary-block');
    this.errorSummaryList = $1('#error-summary-list');
    this.errorText;
    this.errorContainer;

    this.chosenFiles = 0;

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES)
  }

  init() {
    console.log(this.errorSummaryList);
    this.handleUploadState()
    this.bulkImageUploadEvent();
    this.selectAltImageEvent();
    this.singleImageUploadEvent();
  }

  bulkImageUploadEvent() {
    this.bulkImageUploadButton.addEventListener('click', () => {

      // Loop through each file-upload input and grab the selected file data,
      // and the input id (which is the unique id for the wreck item)
      this.photoUploadInputs.forEach((input, index) => {
        let id = input.id;
        const file = new FormData();
        file.append('image', input.files[0]);
        axios.post(
            `/report/property-bulk-image-upload/${id}`,
            file,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true
              /*onUploadProgress: (progressEvent) => {
                const uploadFiles = input.files,
                  uploadFile = uploadFiles[0];

                if (
                  uploadFiles.length &&
                  (uploadFile.type === 'image/png' ||
                    uploadFile.type === 'image/jpg' ||
                    uploadFile.type === 'image/jpeg') &&
                  uploadFile.size < 5000000
                ) {
                  let percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  this.loadingIndicator(percentCompleted);
                }
              }*/
            }
          )
          .then((res) => {
            this.errorText = $1(`#upload-error-text-${id}`, this.el);
            this.errorContainer = $1(`#error-container-${id}`, this.el)

            if (res.data.error) {
              // Create a new error item in the error summary block
              let listItem = document.createElement("li");
              let anchor = document.createElement("a");
              anchor.innerText = res.data.error.text;
              anchor.href = `#photo-upload-container-${id}`;
              listItem.append(anchor);             
              this.errorSummaryList.append(listItem);

              // Add the error text above the input
              this.errorText.innerText = res.data.error.text;
              this.errorContainer.classList.remove('hidden');
              this.errorSummaryBlock.classList.remove('hidden');
              
              this.scrollToTop();
            } else {
              this.errorContainer = $1(`#error-container-${id}`, this.el)
              console.log('SUCCESSFUL UPLOAD');
              this.errorContainer.classList.add('hidden');
              this.photoResults[index].src = `/uploads/${res.data}`;
              this.containersUploaded[index].classList.remove(
                'photo-upload__container--hide'
              );
              this.containersInitial[index].classList.add(
                'photo-upload__container--hide'
              );
            }
          })
          .catch((reqError) => {
            console.error(reqError);
          });
      });
    }); 
  }

  singleImageUploadEvent() {
    this.singleUploadButtons.forEach((element) => {
      element.addEventListener('click', async () => {
        this.id = element.dataset.id;
        const currentInput = $1(`#${this.id}`, this.el);
        const file = new FormData();
        file.append('image', currentInput.files[0]);
        try {
          const res = await axios.post(
            `/report/property-form-image-upload/${this.id}`,
            file,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true,
            }
          );
  
          if (res.data.error) {
            this.errorText.forEach((i) => (i.innerText = res.data.error.text));
            this.errorBlock.forEach((i) => (i.style.display = 'block'));
            console.log('error');
          } else {
            this.errorBlock.forEach((i) => (i.style.display = 'none'));

            let imageSelected = $1(`#selected-photo-${this.id}`);
            const currentInitialContainer = $1(`#photo-upload-container-${this.id}`);
            const currentSelectedImageContainer = $1(`#photo-selected-container-${this.id}`);

            imageSelected.src = `/uploads/${res.data}`;
            currentInitialContainer.classList.add('photo-upload__container--hide');
            currentSelectedImageContainer.classList.remove('photo-upload__container--hide');
          }
        } catch (reqError) {
          console.error(reqError);
        }
      });
    })
  }

  handleUploadState() {
    this.photoUploadInputs.forEach((element) => {
      element.addEventListener('input', () => {
        if (element.value) {
          this.chosenFiles++;
          console.log(this.chosenFiles);
          //element.closest('.govuk-hint').classList.add('hidden');
        } else {
          this.chosenFiles--;
          console.log(this.chosenFiles);
        }

        if (this.chosenFiles === this.photoUploadInputs.length) {
          if (this.bulkImageUploadButton.classList.contains('hidden')) {
            this.addButton.classList.remove('govuk-button--disabled');
            this.addButton.disabled = false;
          } else {
            this.bulkImageUploadButton.classList.remove('govuk-button--disabled');
            this.bulkImageUploadButton.disabled = false;
          }
        }
      })
    })
  }

  selectAltImageEvent() {
    this.replaceImageButtons.forEach((element) => {
      element.addEventListener('click', async () => {
        this.id = element.dataset.id;
        // Select the upload button for the current file input
        const currentUploadBtn = $1(`[data-id=${this.id}]`, this.el);
        try {
          const res = await axios.post(
            `/report/property-form-image-delete/${this.id}`
          );
          if (res) {
            const currentInitialContainer = $1(`#photo-upload-container-${this.id}`);
            const currentSelectedImageContainer = $1(`#photo-selected-container-${this.id}`);
            const currentUploadInput = $1(`#${this.id}`, this.el);

            currentSelectedImageContainer.classList.add('photo-upload__container--hide');
            currentInitialContainer.classList.remove('photo-upload__container--hide');
            currentUploadInput.value = '';
            currentUploadBtn.classList.remove('hidden');

            this.chosenFiles--;
            this.addButton.classList.add('govuk-button--disabled');
            this.addButton.disabled = true;
          }
        } catch (err) {
          console.error(err);
        }
      });
    })
  }

  scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  loadingIndicator(progress) {
    this.uploadProgress.classList.add('upload-progress--visible');
    this.uploadProgressBar.style.width = `${progress}%`;

    this.uploadProgressText.innerText = `Uploading image...`;
    this.uploadProgressPercent.innerText = `${progress}%`;
    if (progress === 100) {
      this.uploadProgressText.innerText = `Image uploaded`;
      setTimeout(() => {
        this.uploadProgress.classList.remove('upload-progress--visible');
        this.continueButton.classList.remove('govuk-button--disabled');
        this.continueButton.disabled = false;
        this.containerInitial.classList.add('photo-upload__container--hide');
        this.containerUploaded.classList.remove(
          'photo-upload__container--hide'
        );
      }, 2000);
    }
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(BulkUpload, "[data-js~=bulk-upload]")
}, QUEUE.DOM)