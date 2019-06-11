/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 */
H5P.ImageJuxtaposition = function ($) {
  /**
   * Constructor function.
   *
   * @param {object} options from semantics.json.
   * @param {number} content id.
   */
  function C(options, id, extras) {
    this.extras = extras;
    // Extend defaults with provided options
    this.options = $.extend(true, {
      title: '',
      imageBefore: {
        imageBefore: undefined,
        labelBefore: ''
      },
      imageAfter: {
        imageAfter: undefined,
        labelAfter: ''
      },
      behavior: {
        startingPosition: 50,
        sliderOrientation: 'horizontal' }
    }, options);
    this.id = id;

    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
  }

  // Extends the event dispatcher
  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Get the content type title.
   *
   * @return {string} title.
   */
  C.prototype.getTitle = function () {
    return H5P.createTitle((this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Image Juxtaposition');
  };

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} container to attach to.
   */
  C.prototype.attach = function ($container) {
    const container = $container.get(0);
    container.classList.add('h5p-image-juxtaposition');

    // Title bar
    if (this.options.title) {
      const title = document.createElement('div');
      title.classList.add('h5p-image-juxtaposition-title');
      title.innerHTML = this.options.title;
      container.appendChild(title);
    }

    // Missing image
    if (typeof this.options.imageBefore.imageBefore === 'undefined' || typeof this.options.imageAfter.imageAfter === 'undefined') {
      const message = document.createElement('div');
      message.classList.add('h5p-image-juxtaposition-missing-images');
      message.innerHTML = ' really need two background images :)';
      container.appendChild(message);

      return;
    }

    // The div element will be filled by JXSlider._onLoaded later
    const content = document.createElement('div');
    content.classList.add('h5p-image-juxtaposition-juxtapose');
    container.appendChild(content);

    // Create the slider
    const slider = new JXSlider('.h5p-image-juxtaposition-juxtapose', [{
      src: H5P.getPath(this.options.imageBefore.imageBefore.path, this.id),
      label: this.options.imageBefore.labelBefore
    }, {
      src: H5P.getPath(this.options.imageAfter.imageAfter.path, this.id),
      label: this.options.imageAfter.labelAfter
    }], {
      startingPosition: this.options.behavior.startingPosition + '%',
      mode: this.options.behavior.sliderOrientation
    }, this);

    // This is needed for Chrome to detect the mouseup outside the iframe
    window.addEventListener('mouseup', function () {
      slider.mouseup();
    });
  };

  /**
   * Create Graphics.
   *
   * @private
   * @param {object} properties from options.
   * @return {JXSlider} slider to attach graphics to.
   */
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

  /**
   * Get dimensions of a DOM element.
   *
   * @private
   * @param {object} DOMelement.
   * @return {object} object containing width and height.
   */
  const getNaturalDimensions = function (DOMelement) {
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
  };

  /**
   * Get dimensions for Graphics.
   *
   * @private
   * @param {object} Graphic object.
   * @return {object} object containing width, height, and ratio.
   */
  const getImageDimensions = function (img) {
    return {
      width: getNaturalDimensions(img).width,
      height: getNaturalDimensions(img).height,
      aspect: function aspect() {
        return this.width / this.height;
      }
    };
  };

  /**
   * Get pageX from event.
   *
   * @private
   * @param {object} event.
   * @return {number} pageX.
   */
  const getPageX = function (e) {
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
  };

  /**
   * Get pageY from event.
   *
   * @private
   * @param {object} event.
   * @return {number} pageY.
   */
  const getPageY = function (e) {
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
  };

  /**
   * Get position for handle bar
   *
   * @private
   * @param {object} slider DOM object.
   * @return {number} position.
   */
  const getLeftPercent = function (slider, input) {
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
      const pageX = getPageX(input);
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
  };

  /**
   * Get position for handle bar
   *
   * @private
   * @param {object} slider DOM object.
   * @return {number} position.
   */
  const getTopPercent = function (slider, input) {
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
      const pageY = getPageY(input);
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
  };

  /**
   * The JXSlider.
   */
  const JXSlider = function (selector, images, options, parent) {
    this.selector = selector;
    this.options = options;
    this.parent = parent;

    if (images.length === 2) {
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    }
    else {
      console.warn('The images parameter takes two Image objects.');
    }
  };

  /**
   * The JXSlider prototype functions.
   */
  JXSlider.prototype = {
    updateSlider: function updateSlider(input, animate) {
      let leftPercent, rightPercent, leftPercentNum;

      if (this.options.mode === 'vertical') {
        leftPercent = getTopPercent(this.slider, input);
      }
      else {
        leftPercent = getLeftPercent(this.slider, input);
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
    },

    /**
     * Set the label for an image
     */
    displayLabel: function displayLabel(element, labelText) {
      const label = document.createElement('div');
      label.className = 'h5p-image-juxtaposition-label';
      label.setAttribute('unselectable', 'on');
      label.setAttribute('onselectstart', 'return false;');
      label.setAttribute('onmousedown', 'return false;');
      label.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
      label.textContent = labelText;

      element.appendChild(label);
    },

    /**
     * Check whether both images habe the same aspect ratio
     */
    checkImages: function checkImages() {
      return getImageDimensions(this.imgBefore.image).aspect() === getImageDimensions(this.imgAfter.image).aspect() ? true : false;
    },

    /**
     * Calculate the image dimensions
     */
    calculateDims: function calculateDims(width, height) {
      const ratio = getImageDimensions(this.imgBefore.image).aspect();
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
    },

    /**
     * Update the wrapper dimensions
     * TODO: enhance for other scaling methods, e.g. for fullscreen
     */
    setWrapperDimensions: function setWrapperDimensions() {
      const targetWidth = Math.floor(window.innerWidth - 2);
      const targetHeight = Math.floor(targetWidth / this.imageRatio);

      this.wrapper.style.width = targetWidth + 'px';
      this.wrapper.style.height = targetHeight + 'px';

      // resize iframe if image's height is too small or too high
      if (((window.innerHeight - $('ul.h5p-actions').outerHeight()) > 0) &&
        ((window.innerHeight - $('ul.h5p-actions').outerHeight() - 1) !== targetHeight)) {
        this.parent.trigger('resize');
      }
    },

    /**
     * Create the DOM elements after images have loaded.
     */
    _onLoaded: function _onLoaded() {
      if (this.imgBefore && this.imgBefore.loaded === true && this.imgAfter && this.imgAfter.loaded === true) {

        this.imageRatio = getImageDimensions(this.imgBefore.image).aspect();

        this.wrapper = document.querySelector(this.selector);
        this.wrapper.style.width = getNaturalDimensions(this.imgBefore.image).width;

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
    },

    /**
     * Trigger mouseup manually (from outside).
     */
    mouseup: function () {
      this.slider.dispatchEvent(new CustomEvent('mouseup'));
    },

    /**
     * Initialize Slider after DOM has been filled
     */
    _init: function _init() {

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
      window.addEventListener('resize', function () {
        self.setWrapperDimensions();
      });

      // Event Listeners for Mouse Interface
      this.slider.addEventListener('mousedown', function (e) {
        e = e || window.event;
        // Don't use preventDefault or Firefox won't detect mouseup outside the iframe.
        self.updateSlider(e, true);
        let animate = true;

        this.addEventListener('mousemove', function (e) {
          e = e || window.event;
          e.preventDefault();
          if (animate) {
            self.updateSlider(e, false);
          }
        });

        this.addEventListener('mouseup', function (e) {
          e = e || window.event;
          e.preventDefault();
          e.stopPropagation();
          this.removeEventListener('mouseup', arguments.callee);
          animate = false;
        });
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
      self.setWrapperDimensions();

      // This is a workaround for our beloved IE that would otherwise distort the images
      this.imgBefore.image.setAttribute('width', '');
      this.imgBefore.image.setAttribute('height', '');
      this.imgAfter.image.setAttribute('width', '');
      this.imgAfter.image.setAttribute('height', '');
    }
  };

  return C;
}(H5P.jQuery);
