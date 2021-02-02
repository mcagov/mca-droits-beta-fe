import axios from 'axios';

import { $, $1 } from '../utilities/selector.js';
import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class ImageUpload {
  constructor(el) {
    if (!el) return;

    this.el = el;

    this.containerInitial = $1('.photo-upload__container--initial', this.el);
    this.containerUploaded = $1('.photo-upload__container--uploaded', this.el);
    this.uploadButton = $1('.photo-upload__button', this.el);
    this.photoUpload = $1('.photo-upload__upload', this.el);
    this.photoResult = $1('.photo-upload__result', this.el);

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    this.uploadPhoto();
  }
  uploadPhoto() {
    this.uploadButton.addEventListener('click', async () => {
      console.log('fe', this.photoUpload.files[0]);

      const id = this.uploadButton.dataset.id;

      const file = new FormData();
      file.append('image', this.photoUpload.files[0]);

      await axios.post(`/report/property-form-image-upload/${id}`, file, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      // this.handleImageSwap(res.image);
    });
  }
  handleImageSwap() {
    this.photoResult.src = 'https://via.placeholder.com/500';
    this.containerInitial.style.display = 'none';
    this.containerUploaded.style.display = 'block';
  }
}
export default LoadManager.queue(() => {
  new ComponentManager(ImageUpload, '[data-js~=image-upload]');
}, QUEUE.DOM);
