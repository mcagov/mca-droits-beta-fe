import axios from 'axios';

import { $, $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class ImageUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;
    this.id;
    this.imagePath;
    this.containerInitial = $1('.photo-upload__container--initial', this.el);
    this.containerUploaded = $1('.photo-upload__container--uploaded', this.el);
    this.uploadButton = $1('.photo-upload__button', this.el);
    this.photoUpload = $1('.photo-upload__upload', this.el);
    this.photoResult = $1('.photo-upload__result', this.el);
    this.uploadButtonChange = $1('.photo-upload__button-change', this.el);

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
            withCredentials: true
          }
        );

        this.imageSelected(`/${res.data}`);
        this.imagePath = res.data;
      } catch (err) {
        console.error(err);
      }
    });
  }
  imageSelected(src) {
    this.photoResult.src = src;
    this.containerInitial.style.display = 'none';
    this.containerUploaded.style.display = 'block';
  }
  selectAltImageEvent() {
    this.uploadButtonChange.addEventListener('click', async () => {
      this.containerUploaded.style.display = 'none';
      this.containerInitial.style.display = 'block';
      this.photoUpload.value = '';

      try {
        const res = await axios.post(
          `/report/property-form-image-delete/${this.id}`,
          { path: this.imagePath }
        );
      } catch (err) {
        console.error(err);
      }
    });
  }
}
export default LoadManager.queue(() => {
  new ComponentManager(ImageUpload, '[data-js~=image-upload]');
}, QUEUE.DOM);
