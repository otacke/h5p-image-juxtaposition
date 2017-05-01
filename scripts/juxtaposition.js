/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 *
 * TODO: Convert DOM Elements to jQuery elements
 * TODO: Clean up code: Slider class to own file, message handling, mouse movement
 */
var H5P = H5P || {};

H5P.ImageJuxtaposition = function ($) {
  /**
   * Constructor function.
   *
   * @param {object} options from semantics.json.
   * @param {number} content id.
   */
  function C(options, id) {
    that = this;

    // Sanitize options
    this.options = options;
    if (!this.options.title) {
      this.options.title = '';
    }
    if (!this.options.imageBefore.labelBefore) {
      this.options.imageBefore.labelBefore = '';
    }
    if (!this.options.imageAfter.labelAfter) {
      this.options.imageAfter.labelAfter = '';
    }
    if (!this.options.behavior.startingPosition) {
      this.options.behavior.startingPosition = 50;
    }
    if (!this.options.behavior.sliderOrientation) {
      this.options.behavior.sliderOrientation = 'horizontal';
    }
    if (!this.options.behavior.sliderColor) {
      this.options.behavior.sliderColor = '#f3f3f3';
    }
    if (!this.options.behavior.maximumWidth) {
      this.options.behavior.maximumWidth = screen.width;
    }
    if (!this.options.behavior.maximumHeight) {
      this.options.behavior.maximumHeight = screen.height;
    }

    this.id = id;

    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
  }

  // Extends the event dispatcher
  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} container to attach to.
   */
  C.prototype.attach = function ($container) {
    that = this;
    var container = $container.get(0);

    container.className = 'h5p-image-juxtaposition';

    if (this.options.title) {
      var title = document.createElement('div');
      title.className = 'h5p-image-juxtaposition-title';
      title.innerHTML = '<h2>' + this.options.title + '</h2>';
      container.appendChild(title);
    }

    if (!this.options.imageBefore.imageBefore  || !this.options.imageAfter.imageAfter) {
      var message = document.createElement('div');
      message.className = 'h5p-image-juxtaposition-missing-images';
      message.innerHTML = 'I really need two background images :)';
      container.appendChild(message);
      return;
    }

    // The div element will be filled by JXSlider._onLoaded later
    var wrapper = document.createElement('div');
    wrapper.className = 'h5p-image-juxtaposition-juxtapose';
    container.appendChild(wrapper);

    // Create the slider
    var slider = new JXSlider('.h5p-image-juxtaposition-juxtapose', [{
      src: H5P.getPath(this.options.imageBefore.imageBefore.path, this.id),
      label: this.options.imageBefore.labelBefore
    }, {
      src: H5P.getPath(this.options.imageAfter.imageAfter.path, this.id),
      label: this.options.imageAfter.labelAfter
    }], {
      startingPosition: this.options.behavior.startingPosition + '%',
      mode: this.options.behavior.sliderOrientation,
      sliderColor: this.options.behavior.sliderColor,
      maximumWidth: this.options.behavior.maximumWidth,
      maximumHeight: this.options.behavior.maximumHeight
    }, this);

    // This is needed for Chrome to detect the mouseup outside the iframe
    window.addEventListener('mouseup', function() {
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
   * Add a class to a DOM element.
   * Could be removed if using jQuery
   *
   * @private
   * @param {object} DOM element.
   * @param {string} className to be added.
   */
  var addClass = function (element, c) {
    if (element.classList) {
      element.classList.add(c);
    }
    else {
      element.className += " " + c;
    }
  };

  /**
   * Set text to a DOM element.
   * Could be removed if using jQuery
   *
   * @private
   * @param {object} DOM element.
   * @param {string} text to be removed.
   */
  var setText = function (element, text) {
    if (document.body.textContent) {
      element.textContent = text;
    }
    else {
      element.innerText = text;
    }
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
   * The JXSlider.
   */
  var JXSlider = function (selector, images, options, parent) {
    this.selector = selector;
    this.options = options;
    this.parent = parent;

    if (images.length === 2) {
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    }
    else {
      console.warn("The images parameter takes two Image objects.");
    }
  };

  /**
   * The JXSlider prototype functions.
   */
  JXSlider.prototype = {
    updateSlider: function updateSlider(input, animate) {
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

      setText(label, labelText);
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
     * TODO: enhance for other scaling methods, e.g. for fullscreen
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
      this.slider.addEventListener("mousedown", function (e) {
        e = e || window.event;
        // Don't use preventDefault or Firefox won't detect mouseup outside the iframe.
        that.updateSlider(e, true);
        var animate = true;

        this.addEventListener("mousemove", function (e) {
          e = e || window.event;
          e.preventDefault();
          if (animate) {
            that.updateSlider(e, false);
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

  return C;
}(H5P.jQuery);
