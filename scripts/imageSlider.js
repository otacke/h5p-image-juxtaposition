/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 *
 * There's not much left of the original code though ...
 */

(function (ImageJuxtaposition) {
  'use strict';

  /**
   * ImageSlider
   *
   * @class H5P.ImageJuxtaposition.ImageSlider
   * @param {string} selector - Class name of parent node.
   * @param {object} images - Array containing the images.
   * @param {string} images.label - Label to put on top of the image.
   * @param {string} images.src - Path to the image.
   * @param {object} options - Options.
   * @param {number} options.maximumHeight - Maximum height for the images.
   * @param {number} options.maximumWidth - Maximum width for the images.
   * @param {string} options.mode - Direction for the slider.
   * @param {string} options.sliderColor - Color for the slider handle.
   * @param {number} options.startingPosition - StartingPosition of the slider.
   * @param {object} parent - Parent class.
   */
  ImageJuxtaposition.ImageSlider = function (selector, images, options, parent) {
    this.selector = selector;
    this.images = images;
    this.options = options;
    this.parent = parent;

    this.mousedown = false;

    if (images.length === 2) {
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    }
    else {
      console.warn("The images parameter takes two Image objects.");
    }
  };

  ImageJuxtaposition.ImageSlider.prototype = {
    /**
     * Update the Slider.
     *
     * @param {event|number} input - Click position.
     * @param {boolean} animate - If true, movement will be animated.
     */
    updateSlider: function updateSlider(input, animate) {
      if ((this.mousedown === false) && (input.type === 'mousemove')) {
        return;
      }
      var firstPercent, secondPercent;
      firstPercent = getFirstPercentage(this.slider, input, this.options.mode);
      firstPercent = parseFloat(firstPercent.toFixed(2));
      secondPercent = 100 - firstPercent;

      // set handler position and image areas
      if (firstPercent > 0 && firstPercent < 100) {
        // add animation effect
        var handle = document.querySelector('.h5p-image-juxtaposition-handle');
        var left = document.querySelector('.h5p-image-juxtaposition-image.h5p-image-juxtaposition-left');
        var right = document.querySelector('.h5p-image-juxtaposition-image.h5p-image-juxtaposition-right');

        if (animate === true) {
          handle.classList.add('transition');
          left.classList.add('transition');
          right.classList.add('transition');
        }
        else {
          handle.classList.remove('transition');
          left.classList.remove('transition');
          right.classList.remove('transition');
        }

        if (this.options.mode === "vertical") {
          this.handle.style.top = firstPercent + '%';
          this.leftImage.style.height = firstPercent + '%';
          this.rightImage.style.height = secondPercent + '%';
        }
        else {
          this.handle.style.left = firstPercent + '%';
          this.leftImage.style.width = firstPercent + '%';
          this.rightImage.style.width = secondPercent + '%';
        }
        this.sliderPosition = firstPercent;
      }

      // update aria
      this.controller.setAttribute('aria-valuenow', firstPercent);
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

        if (this.imgBefore.label) {
          var leftLabel = document.createElement("div");
          leftLabel.className = 'h5p-image-juxtaposition-label';
          leftLabel.setAttribute('unselectable', 'on');
          leftLabel.setAttribute('onselectstart', 'return false;');
          leftLabel.setAttribute('onmousedown', 'return false;');
          leftLabel.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
          leftLabel.innerText = this.imgBefore.label;
          this.leftImage.appendChild(leftLabel);
        }

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

        if (this.imgAfter.label) {
          var rightLabel = document.createElement("div");
          rightLabel.className = 'h5p-image-juxtaposition-label';
          rightLabel.setAttribute('unselectable', 'on');
          rightLabel.setAttribute('onselectstart', 'return false;');
          rightLabel.setAttribute('onmousedown', 'return false;');
          rightLabel.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
          rightLabel.innerText = this.imgAfter.label;
          this.rightImage.appendChild(rightLabel);
        }

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

        this.handle = document.createElement("div");
        this.handle.className = 'h5p-image-juxtaposition-handle';
        this.handle.setAttribute('draggable', 'false');
        this.handle.appendChild(this.leftArrow);
        this.handle.appendChild(this.control);
        this.handle.appendChild(this.rightArrow);

        this.slider = document.createElement("div");
        this.slider.className = 'h5p-image-juxtaposition-slider';
        this.slider.classList.add('h5p-image-juxtaposition-' + this.options.mode);
        this.slider.setAttribute('draggable', 'false');
        this.slider.appendChild(this.handle);
        this.slider.appendChild(this.leftImage);
        this.slider.appendChild(this.rightImage);

        this.wrapper = document.querySelector(this.selector);
        this.wrapper.style.width = this.imgBefore.width;
        this.wrapper.appendChild(this.slider);

        this._init();
      }
    },

    /**
     * Initialize Slider after DOM has been filled
     */
    _init: function _init() {
      var that = this;

      if (this.imgBefore.ratio !== this.imgAfter.ratio) {
        console.warn(this, "Check that the two images have the same aspect ratio for the slider to work correctly.");
      }
      this.imageRatio = this.imgBefore.ratio;

      // Resize listener
      window.addEventListener('resize', function () {
        that.setWrapperDimensions();
      });

      // Event Listeners for Mouse Interface
      document.addEventListener("mousemove", function (e) {
        if (that.animate) {
          that.updateSlider(e, false);
        }
      });
      document.addEventListener('mouseup', function () {
        that.mousedown = false;
      });
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
    this.width = 0;
    this.height = 0;
    this.ratio = 0;
    this.loaded = false;

    this.image.onload = function () {
      that.loaded = true;
      that.width = this.naturalWidth;
      that.height = this.naturalHeight;
      that.ratio = this.naturalWidth / this.naturalHeight;
      slider._onLoaded();
    };

    this.image.src = properties.src;
    this.label = properties.label || false;
  };

  /**
   * Get the percentage that should be displayed of the first image.
   *
   * @param {object} slider - Slider DOM element.
   * @param {event|number} position - Click position.
   * @param {string} mode - Slider orientation.
   * @return {number} Percentage of first image to be displayed.
   */
  var getFirstPercentage = function (slider, position, mode) {
    var firstPercent;
    if (typeof position === 'string' || typeof position === 'number') {
      firstPercent = parseInt(position, 10);
    }
    else {
      var sliderRect = slider.getBoundingClientRect();
      var offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      var width, pagePos, relativePos;
      if (mode === 'vertical') {
        width = slider.offsetHeight;
        pagePos = getCoordinates(position).y;
        relativePos = pagePos - offset.top;
      }
      else {
        width = slider.offsetWidth;
        pagePos = getCoordinates(position).x;
        relativePos = pagePos - offset.left;
      }
      firstPercent = relativePos / width * 100;
    }
    if (firstPercent === 0) {
      firstPercent = 0.01;
    }
    if (firstPercent === 100) {
      firstPercent = 99.99;
    }
    return firstPercent;
  };

  /**
   * Get coordinates from event.
   *
   * @private
   * @param {object} e - Event.
   * @return {object} Coordinates.
   */
  var getCoordinates = function (e) {
    var pageX, pageY;

    if (e.pageX) {
      pageX = e.pageX;
    }
    else if (e.touches) {
      pageX = e.touches[0].pageX;
    }
    else {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    }

    if (e.pageY) {
      pageY = e.pageY;
    }
    else if (e.touches) {
      pageY = e.touches[0].pageY;
    }
    else {
      pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: pageX,
      y: pageY
    };
  };

})(H5P.ImageJuxtaposition);
