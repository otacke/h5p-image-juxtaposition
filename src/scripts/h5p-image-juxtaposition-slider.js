import ImageJuxtapositionImage from './h5p-image-juxtaposition-image';
import ImageJuxtapositionHandle from './h5p-image-juxtaposition-handle';

class ImageJuxtapositionSlider {
  /**
   * @class
   * @param {object} params Parameters from semantics.
   * @param {function} callbackLoaded Callback for slider loaded.
   */
  constructor(params, callbackLoaded) {
    this.params = params;
    this.callbackLoaded = callbackLoaded;

    this.isSliding = false;
    this.imagesLoaded = 0;

    this.buildDOM();
  }

  /**
   * Build DOM.
   */
  buildDOM() {
    // Slider
    this.slider = document.createElement('div');
    this.slider.className = 'h5p-image-juxtaposition-slider';
    this.slider.classList.add('h5p-image-juxtaposition-' + this.params.mode);
    this.slider.setAttribute('draggable', 'false');
    this.params.container.appendChild(this.slider);

    this.imageUUIDs = [H5P.createUUID(), H5P.createUUID()];

    // Slider->Left image
    this.firstImage = new ImageJuxtapositionImage(
      {
        id: this.imageUUIDs[0],
        image: this.params.images[0],
        label: this.params.images[0].label,
        mode: this.params.mode,
        position: 'left',
      },
      () => {
        this.imagesLoaded++;
        this.handleImageLoaded();
      }
    );
    this.slider.appendChild(this.firstImage.getDOM());

    // Slider->Right image
    this.secondImage = new ImageJuxtapositionImage(
      {
        id: this.imageUUIDs[1],
        image: this.params.images[1],
        label: this.params.images[1].label,
        mode: this.params.mode,
        position: 'right',
      },
      () => {
        this.imagesLoaded++;
        this.handleImageLoaded();
      }
    );
    this.slider.appendChild(this.secondImage.getDOM());

    // Slider->Handle
    this.handle = new ImageJuxtapositionHandle(
      {
        ids: this.imageUUIDs,
        ariaValueTextAfter: this.buildAriaValueText(this.params.images[1].label, this.params.images[1].alt),
        ariaValueTextBefore: this.buildAriaValueText(this.params.images[0].label, this.params.images[0].alt),
        color: this.params.color,
        mode: this.params.mode
      },
      (position) => {
        this.update(position);
      }
    );
    this.slider.appendChild(this.handle.getDOM());
  }

  /**
   * Update slider position.
   *
   * @param {Event|string|number} input Event to determine position.
   * @param {boolean} [animate = false] If true, animate position update.
   */
  update(input, animate = false) {
    const positionFirst = this.extractPosition(input).toFixed(2);
    const positionSecond = 100 - positionFirst;

    if (
      (positionFirst < 0 || positionFirst > 100) ||
      (positionSecond < 0 || positionSecond > 100)
    ) {
      return;
    }

    // Update images' width/height
    this.firstImage.update(positionFirst, animate);
    this.secondImage.update(positionSecond, animate);

    // update handle
    this.handle.update(positionFirst, animate);

    // Give focus (back) to handle if user clicked in image
    if (animate && input.target.tagName.toLowerCase() === 'img') {
      this.handle.focus();
    }
  }

  /**
   * Resize slider.
   *
   * @param {object} dimensionsMax Maximum dimensions.
   */
  resize(dimensionsMax) {
    let paddingHorizontal = 0;
    let targetHeight;
    let targetWidth;

    if (dimensionsMax) {
      this.firstImage.setSize({ width: 'auto' });
      this.secondImage.setSize({ width: 'auto' });

      if (this.imageRatio <= (dimensionsMax.width / dimensionsMax.height)) {
        targetHeight = dimensionsMax.height;
        targetWidth = targetHeight * this.imageRatio;
        paddingHorizontal = (dimensionsMax.width - targetWidth) / 2;
        targetWidth = `${targetWidth}px`;
      }
      else {
        targetWidth = dimensionsMax.width;
        targetHeight = targetWidth / this.imageRatio;
        targetWidth = `${targetWidth}px`;
      }
    }
    else {
      targetWidth = this.params.container.offsetWidth;
      targetHeight = targetWidth / this.imageRatio;
      targetWidth = '100%';

      // For some reason necessary on Lumi
      const width = this.slider.getBoundingClientRect().width;
      this.firstImage.setSize({ width: `${width}px` });
      this.secondImage.setSize({ width: `${width}px` });
    }

    if (this.params.container) {
      this.params.container.style.width = targetWidth;
      this.params.container.style.height = `${targetHeight}px`;
      this.params.container.style.paddingLeft = `${paddingHorizontal}px`;
    }
  }

  /**
   * Callback for when image has been loaded.
   */
  handleImageLoaded() {
    if (this.imagesLoaded < 2) {
      return;
    }

    const dimensions = [this.firstImage.getDimensions(), this.secondImage.getDimensions()];
    if (dimensions[0].ratio !== dimensions[1].ratio) {
      console.warn('Make sure that both images have the same aspect ratio.');
    }

    this.imageRatio = dimensions[0].ratio;
    this.params.container.style.width = dimensions[0].width;

    this.addEventListeners();
    this.update(this.params.startingPosition, false);

    this.callbackLoaded();
  }

  /**
   * Build text for aria value.
   *
   * @param {string} [label=''] Image label.
   * @param {string} [alt=''] Image alt text.
   * @returns {string} Aria value text.
   */
  buildAriaValueText(label = '', alt = '') {
    return (label === '') ? alt : `${label}. ${alt}`;
  }

  /**
   * Extract position.
   *
   * @param {Event|string|number} input Input to retrieve position from.
   * @returns {number} Position.
   */
  extractPosition(input) {
    if (typeof input === 'string' || typeof input === 'number') {
      return parseInt(input, 10);
    }

    const sliderRect = this.slider.getBoundingClientRect();
    const offset = {
      top: sliderRect.top + document.body.scrollTop,
      left: sliderRect.left + document.body.scrollLeft
    };

    const positionMax = (this.params.mode === 'horizontal') ?
      this.slider.offsetWidth :
      this.slider.offsetHeight;

    const positionEvent = (this.params.mode === 'horizontal') ?
      this.getPageX(input) :
      this.getPageY(input);

    const positionOffset = (this.params.mode === 'horizontal') ?
      offset.left :
      offset.top;

    return (positionEvent - positionOffset) / positionMax * 100;
  }

  /**
   * Get x position.
   *
   * @param {Event} event Event to retrieve x position from.
   * @returns {number} X position.
   */
  getPageX(event) {
    let pageX;
    if (event.pageX) {
      pageX = event.pageX;
    }
    else if (event.touches) {
      pageX = event.touches[0].pageX;
    }
    else {
      pageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    }
    return pageX;
  }

  /**
   * Get y position.
   *
   * @param {Event} event Event to retrieve y position from.
   * @returns {number} Y position.
   */
  getPageY(event) {
    let pageY;
    if (event.pageY) {
      pageY = event.pageY;
    }
    else if (event.touches) {
      pageY = event.touches[0].pageY;
    }
    else {
      pageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return pageY;
  }

  /**
   * Add event listeners.
   */
  addEventListeners() {
    // Event Listeners for Mouse Interface
    this.slider.addEventListener('mousedown', (event) => {
      event = event || window.event;
      // Don't use preventDefault or Firefox won't detect mouseup outside the iframe.
      this.update(event, true);
      this.isSliding = true;
    });

    // Doesn't work on IE11 if outside of iframe
    window.addEventListener('mousemove', (event) => {
      event = event || window.event;
      event.preventDefault();
      if (this.isSliding === true) {
        this.update(event, false);
      }
    });

    // Event Listeners for Touch Interface
    this.slider.addEventListener('touchstart', (event) => {
      event = event || window.event;
      event.preventDefault();
      event.stopPropagation();
      this.update(event, true);
    });

    this.slider.addEventListener('touchmove', (event) => {
      event = event || window.event;
      event.preventDefault();
      event.stopPropagation();
      this.update(event, false);
    });

    // Detect mouseup out of slider area, doesn't work on IE11
    window.addEventListener('mouseup', (event) => {
      event = event || window.event;
      event.preventDefault();
      event.stopPropagation();
      this.isSliding = false;
    });
  }
}

export default ImageJuxtapositionSlider;
