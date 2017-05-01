(function (ImageJuxtaposition) {
  //'use strict';

  /**
   * Create Graphics.
   *
   * @private
   * @param {object} properties from options.
   * @param {ImageSlider} slider to attach graphics to.
   */
  var Graphic = function (properties, slider) {
    var that = this;
    this.image = new Image();

    this.loaded = false;
    this.image.onload = function () {
      that.loaded = true;
      slider._onLoaded();
    };

    this.image.src = properties.src;
    this.label = properties.label || false;
  };

  /**
   * Get dimensions for Graphics.
   *
   * @private
   * @param {object} Graphic object.
   * @return {object} object containing width, height, and ratio.
   */
  var getImageDimensions = function (img) {
    return {
      width: getNaturalDimensions(img).width,
      height: getNaturalDimensions(img).height,
      aspect: function aspect() {
        return this.width / this.height;
      }
    };
  };

  /**
   * Get dimensions of a DOM element.
   *
   * @private
   * @param {object} DOMelement.
   * @return {object} object containing width and height.
   */
  var getNaturalDimensions = function (DOMelement) {
    if (DOMelement.naturalWidth && DOMelement.naturalHeight) {
      return {
        width: DOMelement.naturalWidth,
        height: DOMelement.naturalHeight
      };
    }
    // http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
    var img = new Image();
    img.src = DOMelement.src;
    return {
      width: img.width,
      height: img.height
    };
  };

  /**
   * Get position for handle bar
   *
   * @private
   * @param {object} slider DOM object.
   * @return {number} position.
   */
  var getLeftPercent = function (slider, input) {
    var leftPercent;
    if (typeof input === "string" || typeof input === "number") {
      leftPercent = parseInt(input, 10);
    }
    else {
      var sliderRect = slider.getBoundingClientRect();
      var offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      var width = slider.offsetWidth;
      var pageX = getPageX(input);
      var relativeX = pageX - offset.left;
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
  var getTopPercent = function (slider, input) {
    var topPercent;
    if (typeof input === "string" || typeof input === "number") {
      topPercent = parseInt(input, 10);
    }
    else {
      var sliderRect = slider.getBoundingClientRect();
      var offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      var width = slider.offsetHeight;
      var pageY = getPageY(input);
      var relativeY = pageY - offset.top;
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
   * Get pageX from event.
   *
   * @private
   * @param {object} event.
   * @return {number} pageX.
   */
  var getPageX = function (e) {
    var pageX;
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
  var getPageY = function (e) {
    var pageY;
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
   * ImageSlider
   *
   * @class H5P.ImageJuxtaposition.ImageSlider
   * @param {string} selector - Class name of parent node.
   * @param {Object} images - Array containing the images.
   * @param {Object} options - Options.
   * @param {Object} parent - Parent class.
   */
  ImageJuxtaposition.ImageSlider = function (selector, images, options, parent) {
    this.selector = selector;
    this.options = options;
    this.parent = parent;

    this.mousedown = false;

    if (images.length === 2) {
      console.log('TODO: include Graphic');
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    }
    else {
      console.warn("The images parameter takes two Image objects.");
    }
  };

  ImageJuxtaposition.ImageSlider.prototype = {
    updateSlider: function updateSlider(input, animate) {
      if ((this.mousedown === false) && (input.type === 'mousemove')) {
        return;
      }
      var leftPercent, rightPercent, leftPercentNum;

      if (this.options.mode === "vertical") {
        leftPercent = getTopPercent(this.slider, input);
      }
      else {
        leftPercent = getLeftPercent(this.slider, input);
      }

      leftPercent = leftPercent.toFixed(2) + "%";
      leftPercentNum = parseFloat(leftPercent);
      rightPercent = 100 - leftPercentNum + "%";

      // set handler position and image areas
      if (leftPercentNum > 0 && leftPercentNum < 100) {
        // add animation effect
        var handle = document.querySelector('.h5p-image-juxtaposition-handle');
        var left = document.querySelector('.h5p-image-juxtaposition-image.h5p-image-juxtaposition-left');
        var right = document.querySelector('.h5p-image-juxtaposition-image.h5p-image-juxtaposition-right');

        if (animate === true) {
          handle.classList.add('transition');
          left.classList.add('transition');
          right.classList.add('transition');
        } else {
          handle.classList.remove('transition');
          left.classList.remove('transition');
          right.classList.remove('transition');
        }

        if (this.options.mode === "vertical") {
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
     * Could be simplified and removed if using jQuery
     */
    displayLabel: function displayLabel(element, labelText) {
      var label = document.createElement("div");
      label.className = 'h5p-image-juxtaposition-label';
      label.setAttribute('unselectable', 'on');
      label.setAttribute('onselectstart', 'return false;');
      label.setAttribute('onmousedown', 'return false;');
      label.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
      label.innerText = labelText;

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
      var ratio = getImageDimensions(this.imgBefore.image).aspect();
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
     */
    setWrapperDimensions: function setWrapperDimensions() {
      // Scale Images
      var maximumWidth = Math.min(this.options.maximumWidth, parseInt(document.querySelector(this.selector).offsetWidth));
      var maximumHeight = this.options.maximumHeight;
      var maxRatio = maximumWidth / maximumHeight;

      var targetWidth;
      var targetHeight;

      if (maxRatio < this.imageRatio) {
        targetWidth = Math.min(Math.floor(window.innerWidth - 2), maximumWidth);
        targetHeight = Math.floor(targetWidth / this.imageRatio);
      }
      else {
        targetHeight = maximumHeight;
        targetWidth = Math.floor(targetHeight * this.imageRatio);
      }

      this.wrapper.style.padding = '0 ' + (window.innerWidth - 2 - targetWidth) / 2 + 'px';
      this.wrapper.style.height = targetHeight + 'px';

      // resize iframe if image's height is too small or too high
      var windowHeight = window.innerHeight;
      var titleHeight = (document.querySelector('.h5p-image-juxtaposition-title')) ? document.querySelector('.h5p-image-juxtaposition-title').offsetHeight : 0;
      var actionBarHeight = document.querySelector('.h5p-actions').offsetHeight;

      if (titleHeight + targetHeight + actionBarHeight + 1 !== windowHeight) {
        this.parent.trigger('resize');
      }
    },

    /**
     * Create the DOM elements after images have loaded.
     */
    _onLoaded: function _onLoaded() {
      if (this.imgBefore && this.imgBefore.loaded === true && this.imgAfter && this.imgAfter.loaded === true) {

        this.imageRatio = getImageDimensions(this.imgBefore.image).aspect();

        // Right Image (incl. actual image)
        this.imgAfter.image.className = 'h5p-image-juxtaposition-rightimg';
        // prevent dragging, etc. when leaving iframe
        this.imgAfter.image.setAttribute('draggable', 'false');
        this.imgAfter.image.setAttribute('unselectable', 'on');
        this.imgAfter.image.setAttribute('onselectstart', 'return false;');
        this.imgAfter.image.setAttribute('onmousedown', 'return false;');

        this.rightImage = document.createElement("div");
        this.rightImage.className = 'h5p-image-juxtaposition-image h5p-image-juxtaposition-right';
        this.rightImage.setAttribute('draggable', 'false');
        this.rightImage.appendChild(this.imgAfter.image);

        // Left Image (incl. actual image)
        this.imgBefore.image.className = 'h5p-image-juxtaposition-leftimg';
        // prevent dragging, etc. when leaving iframe
        this.imgBefore.image.setAttribute('draggable', 'false');
        this.imgBefore.image.setAttribute('unselectable', 'on');
        this.imgBefore.image.setAttribute('onselectstart', 'return false;');
        this.imgBefore.image.setAttribute('onmousedown', 'return false;');

        this.leftImage = document.createElement("div");
        this.leftImage.className = 'h5p-image-juxtaposition-image h5p-image-juxtaposition-left';
        this.leftImage.setAttribute('draggable', 'false');
        this.leftImage.appendChild(this.imgBefore.image);

        // leftArrow + rightArrow
        this.leftArrow = document.createElement("div");
        this.leftArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-left';
        this.leftArrow.setAttribute('draggable', 'false');
        this.rightArrow = document.createElement("div");
        this.rightArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-right';
        this.rightArrow.setAttribute('draggable', 'false');

        if (this.options.mode === 'horizontal') {
          this.leftArrow.style.borderRightColor = this.options.sliderColor;
          this.rightArrow.style.borderLeftColor = this.options.sliderColor;
        }
        else {
          this.leftArrow.style.borderBottomColor = this.options.sliderColor;
          this.rightArrow.style.borderTopColor = this.options.sliderColor;
        }

        // Control (incl. controller)
        this.controller = document.createElement("div");
        this.controller.className = 'h5p-image-juxtaposition-controller';
        this.controller.setAttribute('draggable', 'false');
        this.controller.style.backgroundColor = this.options.sliderColor;
        this.controller.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
        this.controller.setAttribute('role', 'slider');
        this.controller.setAttribute('aria-valuenow', parseInt(this.options.startingPosition));
        this.controller.setAttribute('aria-valuemin', 0);
        this.controller.setAttribute('aria-valuemax', 100);

        this.control = document.createElement("div");
        this.control.className = 'h5p-image-juxtaposition-control';
        this.control.setAttribute('draggable', 'false');
        this.control.style.backgroundColor = this.options.sliderColor;
        this.control.appendChild(this.controller);

        // Handle (leftArrow + control + rightArrow)
        this.handle = document.createElement("div");
        this.handle.className = 'h5p-image-juxtaposition-handle';
        this.handle.setAttribute('draggable', 'false');
        this.handle.appendChild(this.leftArrow);
        this.handle.appendChild(this.control);
        this.handle.appendChild(this.rightArrow);

        // Slider (handle + leftImage + rightImage)
        this.slider = document.createElement("div");
        this.slider.className = 'h5p-image-juxtaposition-slider';
        this.slider.classList.add('h5p-image-juxtaposition-' + this.options.mode);
        this.slider.setAttribute('draggable', 'false');
        this.slider.appendChild(this.handle);
        this.slider.appendChild(this.leftImage);
        this.slider.appendChild(this.rightImage);

        // Wrapper
        this.wrapper = document.querySelector(this.selector);
        this.wrapper.style.width = getNaturalDimensions(this.imgBefore.image).width;
        this.wrapper.appendChild(this.slider);

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
        console.warn(this, "Check that the two images have the same aspect ratio for the slider to work correctly.");
      }

      // Display labels
      if (this.imgBefore.label) {
        this.displayLabel(this.leftImage, this.imgBefore.label);
      }
      if (this.imgAfter.label) {
        this.displayLabel(this.rightImage, this.imgAfter.label);
      }

      var that = this;
      window.addEventListener('resize', function () {
        that.setWrapperDimensions();
      });

      // Event Listeners for Mouse Interface
      document.addEventListener("mousemove", function (e) {
        if (that.animate) {
          that.updateSlider(e, false);
        }
      });
      document.addEventListener('mouseup', function (e) {
        console.log('mouseup');
        that.mousedown = false;
      });
      // Event Listeners for Mouse Interface
      this.slider.addEventListener("mousedown", function (e) {
        e = e || window.event;
        that.mousedown = true;
        that.updateSlider(e, true);
        that.animate = true;
      });

      // Event Listeners for Touch Interface
      this.slider.addEventListener('touchstart', function (e) {
        e = e || window.event;
        e.preventDefault();
        e.stopPropagation();
        that.updateSlider(e, true);

        this.addEventListener('touchmove', function (e) {
          e = e || window.event;
          e.preventDefault();
          e.stopPropagation();
          that.updateSlider(e, false);
        });
      });

      // Event Listeners for Keyboard on handle
      this.handle.addEventListener('keydown', function (e) {
        e = e || window.event;
        var key = e.which || e.keyCode;
        var ariaValue = parseFloat(this.style.left || this.style.top);
        var position = 0;

        // handler left
        if (key === 37) {
          position = Math.max(0, ariaValue - 1);
          that.updateSlider(position, false);
          that.controller.setAttribute('aria-valuenow', position);
        }

        // handler right
        if (key === 39) {
          position = Math.min(100, ariaValue + 1);
          that.updateSlider(position, false);
          that.controller.setAttribute('aria-valuenow', position);
        }
      });

      // Event Listeners for Keyboard on images
      this.leftImage.addEventListener('keydown', function (e) {
        var key = e.which || e.keyCode;
        if ((key === 13) || (key === 32)) {
          that.updateSlider('90%', true);
          that.controller.setAttribute('aria-valuenow', 90);
        }
      });

      this.rightImage.addEventListener('keydown', function (e) {
        var key = e.which || e.keyCode;
        if ((key === 13) || (key === 32)) {
          that.updateSlider('10%', true);
          that.controller.setAttribute('aria-valuenow', 10);
        }
      });

      that.updateSlider(this.options.startingPosition, false);
      that.setWrapperDimensions();

      // This is a workaround for our beloved IE that would otherwise distort the images
      document.querySelector('.h5p-image-juxtaposition-leftimg').setAttribute('width', '');
      document.querySelector('.h5p-image-juxtaposition-leftimg').setAttribute('height', '');
      document.querySelector('.h5p-image-juxtaposition-rightimg').setAttribute('width', '');
      document.querySelector('.h5p-image-juxtaposition-rightimg').setAttribute('height', '');
    }
  };

})(H5P.ImageJuxtaposition);
