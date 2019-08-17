/** Class representing a Slider Image including a label */
class ImageJuxtapositionImage {
  /**
   * @constructor
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
   * @return {HTMLElement} Image DOM.
   */
  getDOM() {
    return this.imageDOM;
  }

  /**
   * Get width, height and aspect ratio.
   * @return {object} Object containing width, height, and ratio.
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
   * Build image DOM.
   */
  buildDOM() {
    this.imageDOM = document.createElement('div');
    this.imageDOM.className = `h5p-image-juxtaposition-image h5p-image-juxtaposition-${this.params.position}`;
    this.imageDOM.setAttribute('draggable', 'false');

    // Image
    this.image = new Image();
    this.image.onload = () => {
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
    // This is a workaround for our beloved IE that would otherwise distort the images
    this.image.setAttribute('width', '');
    this.image.setAttribute('height', '');

    this.imageDOM.appendChild(this.image);

    // Label
    if (this.params.label && this.params.label !== '') {
      const label = document.createElement('div');
      label.className = 'h5p-image-juxtaposition-label';
      label.setAttribute('unselectable', 'on');
      label.setAttribute('onselectstart', 'return false;');
      label.setAttribute('onmousedown', 'return false;');
      label.innerHTML = this.params.label;

      this.imageDOM.appendChild(label);
    }
  }
}

export default ImageJuxtapositionImage;
