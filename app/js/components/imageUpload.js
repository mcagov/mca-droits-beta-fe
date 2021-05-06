import axios from 'axios';

import { $, $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class ImageUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;
    this.id;
    this.image;
    this.pageTitle = document.title;
    this.containerInitial = $1('.photo-upload__container--initial', this.el);
    this.containerUploaded = $1('.photo-upload__container--uploaded', this.el);
    this.uploadButton = $1('.photo-upload__button', this.el);
    this.continueButton = $1('.photo-upload__continue-button', this.el);
    this.photoUpload = $1('.photo-upload__upload', this.el);
    this.photoResult = $1('.photo-upload__result', this.el);
    this.uploadButtonChange = $1('.photo-upload__button-change', this.el);
    this.errorBlock = $('.upload-error', this.el);
    this.errorText = $('.upload-error__text', this.el);
    this.uploadProgress = $1('.upload-progress', this.el);
    this.uploadProgressBar = $1('.upload-progress__bar span', this.el);
    this.uploadProgressText = $1('.upload-progress__text', this.el);
    this.uploadProgressPercent = $1('.upload-progress__percent', this.el);
    this.continueButton = $1('.govuk-button--continue', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.uploadPhotoEvent();
    this.selectAltImageEvent();
  }
  uploadPhotoEvent() {
    this.uploadButton.addEventListener('click', async () => {
      this.id = this.uploadButton.dataset.id;
      const file = new FormData();
      file.append('image', this.photoUpload.files[0]);
      try {
        const res = await axios.post(
          `/report/property-form-image-upload/${this.id}`,
          file,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              const uploadFiles = this.photoUpload.files,
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
            },
          }
        );

        if (res.data.error) {
          document.title = "Error: " + this.pageTitle;
          this.errorText.forEach((i) => (i.innerText = res.data.error.text));
          this.scrollToTop();
          this.errorBlock.forEach((i) => {
            i.classList.add('block');
            i.classList.remove('hidden');
          });
        } else {
          document.title = this.pageTitle;
          this.errorBlock.forEach((i) => {
            i.classList.add('hidden');
            i.classList.remove('block');
          });
          this.imageSelected(`/uploads/${res.data.uploadedFilename}`, res.data.originalFilename);
          this.image = res.data.uploadedFilename;
          this.continueButton.disabled = false;
          this.continueButton.setAttribute('aria-disabled', false);
        }
      } catch (reqError) {
        console.error(reqError);
      }
    });
  }
  imageSelected(src, alt) {
    this.photoResult.src = src;
    this.photoResult.alt = `uploaded image ${alt}`;
  }
  selectAltImageEvent() {
    this.id = this.uploadButtonChange.dataset.id;

    this.uploadButtonChange.addEventListener('click', async () => {
      try {
        const res = await axios.post(
          `/report/property-form-image-delete/${this.id}`
        );
        if (res) {
          this.containerUploaded.classList.add('photo-upload__container--hide');
          this.containerInitial.classList.remove(
            'photo-upload__container--hide'
          );
          this.photoUpload.value = '';
          this.continueButton.classList.add('govuk-button--disabled');
          this.continueButton.disabled = true;
          this.continueButton.setAttribute('aria-disabled', true);
          this.photoUpload.focus();
        }
      } catch (err) {
        console.error(err);
      }
    });
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
        this.continueButton.setAttribute('aria-disabled', false);
        this.containerInitial.classList.add('photo-upload__container--hide');
        this.containerUploaded.classList.remove(
          'photo-upload__container--hide'
        );
      }, 1000);
    }
  }
}

export function SingleImageUpload() {
  this.uploadPhotoEvent();
}

export default LoadManager.queue(() => {
  new ComponentManager(ImageUpload, '[data-js~=image-upload]');
}, QUEUE.DOM);
