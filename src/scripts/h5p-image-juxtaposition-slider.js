class ImageJuxtapositionSlider {
  constructor(selector, images, options, parent) {
    this.selector = selector;
    this.options = options;
    this.parent = parent;
    this.internalResize = false;

    this.animate = false;

    const Graphic = function (properties, slider) {
      const self = this;
      this.image = new Image();

      this.loaded = false;
      this.image.onload = function () {
        self.loaded = true;
        slider._onLoaded();
      };

      this.image.src = properties.src;
      this.label = properties.label || false;
    };

    if (images.length === 2) {
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    }
    else {
      console.warn('The images parameter takes two Image objects.');
    }
  }

  buildGraphic(properties, slider) {
    const image = new Image();
    image.loaded = false;
    image.onload = () => {
      image.loaded = true;
      slider._onLoaded();
    };

    return {
      image: image,
      label: properties.label || false
    };
  }

  updateSlider(input, animate) {
    let leftPercent, rightPercent, leftPercentNum;

    if (this.options.mode === 'vertical') {
      leftPercent = this.getTopPercent(this.slider, input);
    }
    else {
      leftPercent = this.getLeftPercent(this.slider, input);
    }

    leftPercent = leftPercent.toFixed(2) + '%';
    leftPercentNum = parseFloat(leftPercent);
    rightPercent = 100 - leftPercentNum + '%';

    // set handler position and image areas
    if (leftPercentNum > 0 && leftPercentNum < 100) {
      // add animation effect
      if (animate === true) {
        this.handle.classList.add('transition');
        this.leftImage.classList.add('transition');
        this.rightImage.classList.add('transition');
      }
      else {
        this.handle.classList.remove('transition');
        this.leftImage.classList.remove('transition');
        this.rightImage.classList.remove('transition');
      }

      if (this.options.mode === 'vertical') {
        this.handle.style.top = leftPercent;
        this.leftImage.style.height = leftPercent;
        this.rightImage.style.height = rightPercent;
      }
      else {
        this.handle.style.left = leftPercent;
        this.leftImage.style.width = leftPercent;
        this.rightImage.style.width = rightPercent;
      }
      this.sliderPosition = leftPercent;
    }

    // update aria
    this.controller.setAttribute('aria-valuenow', leftPercentNum);
  }

  displayLabel(element, labelText) {
    const label = document.createElement('div');
    label.className = 'h5p-image-juxtaposition-label';
    label.setAttribute('unselectable', 'on');
    label.setAttribute('onselectstart', 'return false;');
    label.setAttribute('onmousedown', 'return false;');
    label.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
    label.textContent = labelText;

    element.appendChild(label);
  }

  checkImages() {
    return this.getImageDimensions(this.imgBefore.image).aspect() === this.getImageDimensions(this.imgAfter.image).aspect() ? true : false;
  }

  calculateDims(width, height) {
    const ratio = this.getImageDimensions(this.imgBefore.image).aspect();
    if (width) {
      height = width / ratio;
    }
    else if (height) {
      width = height * ratio;
    }
    return {
      width: width,
      height: height,
      ratio: ratio
    };
  }

  setWrapperDimensions() {
    const targetWidth = window.innerWidth - 2;
    const targetHeight = targetWidth / this.imageRatio;

    if (this.wrapper) {
      this.wrapper.style.width = targetWidth + 'px';
      this.wrapper.style.height = targetHeight + 'px';
    }
  }

  _onLoaded() {
    if (this.imgBefore && this.imgBefore.loaded === true && this.imgAfter && this.imgAfter.loaded === true) {

      this.imageRatio = this.getImageDimensions(this.imgBefore.image).aspect();

      this.wrapper = document.querySelector(this.selector);
      this.wrapper.style.width = this.getNaturalDimensions(this.imgBefore.image).width;

      this.slider = document.createElement('div');
      this.slider.className = 'h5p-image-juxtaposition-slider';
      this.slider.classList.add('h5p-image-juxtaposition-' + this.options.mode);
      this.slider.setAttribute('draggable', 'false');
      this.wrapper.appendChild(this.slider);

      this.handle = document.createElement('div');
      this.handle.className = 'h5p-image-juxtaposition-handle';
      this.handle.setAttribute('draggable', 'false');

      this.rightImage = document.createElement('div');
      this.rightImage.className = 'h5p-image-juxtaposition-image h5p-image-juxtaposition-right';
      this.rightImage.setAttribute('draggable', 'false');

      this.imgAfter.image.classList.add('h5p-image-juxtaposition-rightimg');

      // TODO: Make simpler (prevent dragging, etc. when leaving iframe)
      this.imgAfter.image.setAttribute('draggable', 'false');
      this.imgAfter.image.setAttribute('unselectable', 'on');
      this.imgAfter.image.setAttribute('onselectstart', 'return false;');
      this.imgAfter.image.setAttribute('onmousedown', 'return false;');

      this.rightImage.appendChild(this.imgAfter.image);

      this.leftImage = document.createElement('div');
      this.leftImage.className = 'h5p-image-juxtaposition-image h5p-image-juxtaposition-left';
      this.leftImage.setAttribute('draggable', 'false');

      this.imgBefore.image.classList.add('h5p-image-juxtaposition-leftimg');

      // TODO: Make simpler (prevent dragging, etc. when leaving iframe)
      this.imgBefore.image.setAttribute('draggable', 'false');
      this.imgBefore.image.setAttribute('unselectable', 'on');
      this.imgBefore.image.setAttribute('onselectstart', 'return false;');
      this.imgBefore.image.setAttribute('onmousedown', 'return false;');

      this.leftImage.appendChild(this.imgBefore.image);

      this.slider.appendChild(this.handle);
      this.slider.appendChild(this.leftImage);
      this.slider.appendChild(this.rightImage);

      this.leftArrow = document.createElement('div');
      this.rightArrow = document.createElement('div');
      this.control = document.createElement('div');
      this.controller = document.createElement('div');

      this.leftArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-left';
      this.leftArrow.setAttribute('draggable', 'false');
      this.rightArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-right';
      this.rightArrow.setAttribute('draggable', 'false');
      this.control.className = 'h5p-image-juxtaposition-control';
      this.control.setAttribute('draggable', 'false');
      this.controller.className = 'h5p-image-juxtaposition-controller';
      this.controller.setAttribute('draggable', 'false');

      this.controller.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
      this.controller.setAttribute('role', 'slider');
      this.controller.setAttribute('aria-valuenow', parseInt(this.options.startingPosition));
      this.controller.setAttribute('aria-valuemin', 0);
      this.controller.setAttribute('aria-valuemax', 100);

      this.handle.appendChild(this.leftArrow);
      this.handle.appendChild(this.control);
      this.handle.appendChild(this.rightArrow);
      this.control.appendChild(this.controller);

      this._init();
    }
  }

  getNaturalDimensions(DOMelement) {
    if (DOMelement.naturalWidth && DOMelement.naturalHeight) {
      return {
        width: DOMelement.naturalWidth,
        height: DOMelement.naturalHeight
      };
    }
    // http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
    const img = new Image();
    img.src = DOMelement.src;
    return {
      width: img.width,
      height: img.height
    };
  }

  /**
   * Get dimensions for Graphics.
   *
   * @private
   * @param {object} Graphic object.
   * @return {object} object containing width, height, and ratio.
   */
  getImageDimensions(img) {
    return {
      width: this.getNaturalDimensions(img).width,
      height: this.getNaturalDimensions(img).height,
      aspect: function aspect() {
        return this.width / this.height;
      }
    };
  }


  getLeftPercent(slider, input) {
    let leftPercent;
    if (typeof input === 'string' || typeof input === 'number') {
      leftPercent = parseInt(input, 10);
    }
    else {
      const sliderRect = slider.getBoundingClientRect();
      const offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      const width = slider.offsetWidth;
      const pageX = this.getPageX(input);
      const relativeX = pageX - offset.left;
      leftPercent = relativeX / width * 100;
    }
    if (leftPercent === 0) {
      leftPercent = 0.01;
    }
    if (leftPercent === 100) {
      leftPercent = 99.99;
    }
    return leftPercent;
  }

  getPageX(e) {
    let pageX;
    if (e.pageX) {
      pageX = e.pageX;
    }
    else if (e.touches) {
      pageX = e.touches[0].pageX;
    }
    else {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    }
    return pageX;
  }

  getPageY(e) {
    let pageY;
    if (e.pageY) {
      pageY = e.pageY;
    }
    else if (e.touches) {
      pageY = e.touches[0].pageY;
    }
    else {
      pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return pageY;
  }

  getTopPercent(slider, input) {
    let topPercent;
    if (typeof input === 'string' || typeof input === 'number') {
      topPercent = parseInt(input, 10);
    }
    else {
      const sliderRect = slider.getBoundingClientRect();
      const offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      const width = slider.offsetHeight;
      const pageY = this.getPageY(input);
      const relativeY = pageY - offset.top;
      topPercent = relativeY / width * 100;
    }
    if (topPercent === 0) {
      topPercent = 0.01;
    }
    if (topPercent === 100) {
      topPercent = 99.99;
    }
    return topPercent;
  }

  mouseup() {
    this.slider.dispatchEvent(new CustomEvent('mouseup'));
  }

  _init() {
    if (this.checkImages() === false) {
      console.warn(this, 'Check that the two images have the same aspect ratio for the slider to work correctly.');
    }

    // Display labels
    if (this.imgBefore.label) {
      this.displayLabel(this.leftImage, this.imgBefore.label);
    }
    if (this.imgAfter.label) {
      this.displayLabel(this.rightImage, this.imgAfter.label);
    }

    const self = this;

    // Event Listeners for Mouse Interface
    this.slider.addEventListener('mousedown', function (e) {
      e = e || window.event;
      // Don't use preventDefault or Firefox won't detect mouseup outside the iframe.
      self.updateSlider(e, true);
      this.animate = true;
    });

    this.slider.addEventListener('mousemove', function (e) {
      e = e || window.event;
      e.preventDefault();
      if (this.animate === true) {
        self.updateSlider(e, false);
      }
    });

    this.slider.addEventListener('mouseup', function (e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      this.animate = false;
    });

    // Event Listeners for Touch Interface
    this.slider.addEventListener('touchstart', function (e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      self.updateSlider(e, true);

      this.addEventListener('touchmove', function (e) {
        e = e || window.event;
        e.preventDefault();
        e.stopPropagation();
        self.updateSlider(e, false);
      });
    });

    // Event Listeners for Keyboard on handle
    this.handle.addEventListener('keydown', function (e) {
      e = e || window.event;
      const key = e.which || e.keyCode;
      const ariaValue = parseFloat(this.style.left || this.style.top);
      let position = 0;

      // handler left
      if (key === 37) {
        position = Math.max(0, ariaValue - 1);
        self.updateSlider(position, false);
        self.controller.setAttribute('aria-valuenow', position);
      }

      // handler right
      if (key === 39) {
        position = Math.min(100, ariaValue + 1);
        self.updateSlider(position, false);
        self.controller.setAttribute('aria-valuenow', position);
      }
    });

    // Event Listeners for Keyboard on images
    this.leftImage.addEventListener('keydown', function (e) {
      const key = e.which || e.keyCode;
      if ((key === 13) || (key === 32)) {
        self.updateSlider('90%', true);
        self.controller.setAttribute('aria-valuenow', 90);
      }
    });

    this.rightImage.addEventListener('keydown', function (e) {
      const key = e.which || e.keyCode;
      if ((key === 13) || (key === 32)) {
        self.updateSlider('10%', true);
        self.controller.setAttribute('aria-valuenow', 10);
      }
    });

    self.updateSlider(this.options.startingPosition, false);

    // This is a workaround for our beloved IE that would otherwise distort the images
    this.imgBefore.image.setAttribute('width', '');
    this.imgBefore.image.setAttribute('height', '');
    this.imgAfter.image.setAttribute('width', '');
    this.imgAfter.image.setAttribute('height', '');

    // TODO: Find a way to get rid of that extra resize
    self.parent.trigger('resize');
    setTimeout(() => {
      self.parent.trigger('resize');
    }, 0);
  }
}

export default ImageJuxtapositionSlider;
