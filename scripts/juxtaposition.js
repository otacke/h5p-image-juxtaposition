/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 *
 * TODO: Convert DOM Elements to jQuery elements
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
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
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
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} container to attach to.
   */
  C.prototype.attach = function ($container) {
    this.container = $container;
    $container.addClass("h5p-image-juxtaposition");
    if (this.options.title) {
      $container.append('<div class="title">' + this.options.title + '</div>');
    }

    if (typeof this.options.imageBefore.imageBefore === 'undefined' || typeof this.options.imageAfter.imageAfter === undefined) {
      $container.append('<div class="missing-images">I really need two background images :)</div>');
      return;
    }

    // The div element will be filled by JXSlider._onLoaded later
    $container.append('<div class="juxtapose"></div>');

    // Create the slider
    var slider = new JXSlider('.juxtapose', [{
      src: H5P.getPath(this.options.imageBefore.imageBefore.path, this.id),
      label: this.options.imageBefore.labelBefore
    }, {
      src: H5P.getPath(this.options.imageAfter.imageAfter.path, this.id),
      label: this.options.imageAfter.labelAfter
    }], {
      startingPosition: this.options.behavior.startingPosition + '%',
      mode: this.options.behavior.sliderOrientation
    }, this);
  };

  /**
   * Create Graphics.
   *
   * @private
   * @param {object} properties from options.
   * @return {JXSlider} slider to attach graphics to.
   */
  var Graphic = function (properties, slider) {
    var self = this;
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
   * get computed width and height for a DOM element.
   * could probably be removed if using jQuery
   *
   * @private
   * @param {object} DOM element.
   * @return {object} width and height.
   */
  var getComputedWidthAndHeight = function (element) {
    if (window.getComputedStyle) {
      return {
        width: parseInt(getComputedStyle(element).width, 10),
        height: parseInt(getComputedStyle(element).height, 10)
      };
    }
    else {
      var w = element.getBoundingClientRect().right - element.getBoundingClientRect().left;
      var h = element.getBoundingClientRect().bottom - element.getBoundingClientRect().top;
      return {
        width: parseInt(w, 10) || 0,
        height: parseInt(h, 10) || 0
      };
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
      label.className = 'jx-label';
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
     */
    setWrapperDimensions: function setWrapperDimensions() {
      // this might benefit from jQuery
      var dims = this.calculateDims(getComputedWidthAndHeight(this.wrapper).width, getComputedWidthAndHeight(this.wrapper).height);
      var containerWidth = $('.h5p-image-juxtaposition').width();

      // The plugin is responsive, and this will upscale images in portrait mode
      if ($('.jx-leftimg').width() / containerWidth < this.originalRatio) {
        dims.width = containerWidth * this.originalRatio;
      }

      // Rescale to account for responsive container resizing
      // Landscape
      if (dims.width < containerWidth) {
        if (dims.ratio >= 1) {
          dims = this.calculateDims(containerWidth, 0);
        }
      }
      // Portrait
      else if (dims.width > containerWidth) {
        dims = this.calculateDims(0, containerWidth);
      }

      // Update wrapper size
      this.wrapper.style.height = parseInt(dims.height) + "px";
      this.wrapper.style.width = parseInt(dims.width) + "px";
    },

    /**
     * Create the DOM elements after images have loaded.
     */
    _onLoaded: function _onLoaded() {
      if (this.imgBefore && this.imgBefore.loaded === true && this.imgAfter && this.imgAfter.loaded === true) {
        // TODO: We might change all this to jQuery to make the code a little easier to read
        this.wrapper = document.querySelector(this.selector);
        this.wrapper.style.width = getNaturalDimensions(this.imgBefore.image).width;

        this.setWrapperDimensions();

        this.slider = document.createElement("div");
        this.slider.className = 'jx-slider';
        this.wrapper.appendChild(this.slider);

        addClass(this.slider, this.options.mode);

        this.handle = document.createElement("div");
        this.handle.className = 'jx-handle';

        this.rightImage = document.createElement("div");
        this.rightImage.className = 'jx-image jx-right';
        this.rightImageIMG = $(this.imgAfter.image).addClass('jx-rightimg');
        this.rightImage.appendChild(this.rightImageIMG[0]);

        this.leftImage = document.createElement("div");
        this.leftImage.className = 'jx-image jx-left';
        this.leftImageIMG = $(this.imgBefore.image).addClass('jx-leftimg');
        this.leftImage.appendChild(this.leftImageIMG[0]);

        this.slider.appendChild(this.handle);
        this.slider.appendChild(this.leftImage);
        this.slider.appendChild(this.rightImage);

        this.leftArrow = document.createElement("div");
        this.rightArrow = document.createElement("div");
        this.control = document.createElement("div");
        this.controller = document.createElement("div");

        this.leftArrow.className = 'jx-arrow jx-left';
        this.rightArrow.className = 'jx-arrow jx-right';
        this.control.className = 'jx-control';
        this.controller.className = 'jx-controller';

        this.controller.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
        this.controller.setAttribute('role', 'slider');
        this.controller.setAttribute('aria-valuenow', 50);
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
     * Initialize Slider after DOM has been filled
     */
    _init: function _init() {

      if (this.checkImages() === false) {
        console.warn(this, "Check that the two images have the same aspect ratio for the slider to work correctly.");
      }

      this.updateSlider(this.options.startingPosition, false);

      // Display labels
      if (this.imgBefore.label) {
        this.displayLabel(this.leftImage, this.imgBefore.label);
      }
      if (this.imgAfter.label) {
        this.displayLabel(this.rightImage, this.imgAfter.label);
      }

      var self = this;
      window.addEventListener('resize', function () {
        self.setWrapperDimensions();
      });

      // Event Listeners for Mouse Interface
      this.slider.addEventListener("mousedown", function (e) {
        e = e || window.event;
        e.preventDefault();
        self.updateSlider(e, true);
        var animate = true;

        this.addEventListener("mousemove", function (e) {
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
          //this.removeEventListener('mouseup', arguments.callee);
          animate = false;
        });

        this.addEventListener('mouseleave', function (e) {
          e = e || window.event;
          e.preventDefault();
          e.stopPropagation();
          //this.removeEventListener('mouseup', arguments.callee);
          animate = false;
        });
      });

      // Event Listeners for Touch Interface
      this.slider.addEventListener("touchstart", function (e) {
        e = e || window.event;
        e.preventDefault();
        e.stopPropagation();
        self.updateSlider(e, true);

        this.addEventListener("touchmove", function (e) {
          e = e || window.event;
          e.preventDefault();
          e.stopPropagation();
          self.updateSlider(event, false);
        });
      });

      self.setWrapperDimensions();
      self.updateSlider(this.options.startingPosition, false);
      this.parent.trigger('resize');
      this.originalRatio = $('.jx-leftimg').width() / $('.h5p-image-juxtaposition').width();

      // This is a workaround for our beloved IE that would otherwise distort the images
      $('.jx-leftimg').attr({ width: '', height: '' });
      $('.jx-rightimg').attr({ width: '', height: '' });
    }
  };

  return C;
}(H5P.jQuery);
