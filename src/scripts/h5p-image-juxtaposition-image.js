/** Class representing a Slider Image including a label */
class ImageJuxtapositionImage {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {function} callbackLoaded Callback for when image is loaded.
   */
  constructor(params, callbackLoaded) {
    this.params = params;
    this.callbackLoaded = callbackLoaded;

    this.loaded = false;

    this.buildDOM();
  }

  /**
   * Get DOM.
   *
   * @returns {HTMLElement} Image DOM.
   */
  getDOM() {
    return this.imageDOM;
  }

  /**
   * Get width, height and aspect ratio.
   *
   * @returns {object} Object containing width, height, and ratio.
   */
  getDimensions() {
    if (!this.isLoaded) {
      return {
        width: 0,
        height: 0,
        ratio: 1
      };
    }

    return {
      width: this.image.naturalWidth,
      height: this.image.naturalHeight,
      ratio: this.image.naturalWidth / this.image.naturalHeight
    };
  }

  /**
   * Set height/width determined by slider position.
   *
   * @param {number} position Position.
   * @param {boolean} [animate=false] Set animated state if true.
   */
  update(position, animate = false) {
    if (animate === true) {
      this.imageDOM.classList.add('transition');
    }
    else {
      this.imageDOM.classList.remove('transition');
    }

    if (this.params.mode === 'horizontal') {
      this.imageDOM.style.width = `${position}%`;
    }
    else {
      this.imageDOM.style.height = `${position}%`;
    }
  }

  /**
   * Set image element size.
   *
   * @param {object} [dimensions={}] Dimensions.
   * @param {string} [dimensions.height] Any CSS height value.
   * @param {string} [dimensions.width] Any CSS width value.
   */
  setSize(dimensions = {}) {
    if (dimensions.height === 'auto') {
      this.image.style.height = '';
    }
    else if (dimensions.height) {
      this.image.style.height = dimensions.width;
    }

    if (dimensions.width === 'auto') {
      this.image.style.width = '';
    }
    else if (dimensions.width) {
      this.image.style.width = dimensions.width;
    }
  }

  /**
   * Build image DOM.
   */
  buildDOM() {
    this.imageDOM = document.createElement('div');
    this.imageDOM.setAttribute('id', this.params.id);
    this.imageDOM.className = `h5p-image-juxtaposition-image h5p-image-juxtaposition-${this.params.position}`;
    this.imageDOM.setAttribute('draggable', 'false');

    // Image
    this.image = new Image();
    this.image.onload = () => {
      // This is a workaround for our beloved IE that would otherwise distort the images
      this.image.setAttribute('width', '');
      this.image.setAttribute('height', '');

      this.isLoaded = true;
      this.callbackLoaded();
    };

    this.image.src = this.params.image.src;
    this.image.alt = this.params.image.alt || '';
    this.image.title = this.params.image.title || '';
    this.label = this.params.label || false;
    this.image.setAttribute('draggable', 'false');
    this.image.setAttribute('unselectable', 'on');
    this.image.setAttribute('onselectstart', 'return false;');
    this.image.setAttribute('onmousedown', 'return false;');
    this.image.setAttribute('aria-hidden', 'true');

    this.imageDOM.appendChild(this.image);

    // Label
    if (this.params.label && this.params.label !== '') {
      const label = document.createElement('div');
      label.className = 'h5p-image-juxtaposition-label';
      label.setAttribute('unselectable', 'on');
      label.setAttribute('onselectstart', 'return false;');
      label.setAttribute('onmousedown', 'return false;');
      label.setAttribute('aria-hidden', 'true');
      label.innerHTML = this.params.label;

      this.imageDOM.appendChild(label);
    }
  }
}

export default ImageJuxtapositionImage;
