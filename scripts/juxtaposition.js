/*
 * TODO: clean up code
 * TODO: style the output
 * TODO: localization
 * TODO: make options look nicer, e.g. with a list of exactly 2 items
 * TODO: test with all kinds of images (small, big, different sizes, etc.)
 * TODO: possibly: implement fullscreen mode, https://h5p.org/using-fullscreen
 */

/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 */
var H5P = H5P || {};

H5P.ImageJuxtaposition = function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      title: '',
      image1: null,
      label1: '',
      image2: null,
      label2: '',
      behavior: {
        startingPosition: 50,
        sliderOrientation: 'horizontal' }
    }, options);
    this.id = id;

    /*
     * Someone might try to create a site with more than one slider, and we
     * might want to cover that.
     */
    var juxtapose = {
      sliders: []
    };
    window.juxtapose = window.juxtapose || juxtapose;
    this.sliderID = window.juxtapose.sliders.length;
  };

  /**
   * Attach function called by H5P framework to insert H5P content into page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    $container.addClass("h5p-image-juxtaposition");
    if (this.options.title) {
      $container.append('<div class="title">' + this.options.title + '</div>');
    }
    if (this.options.image1 === null || this.options.image2 === null) {
      $container.append('<div class="missing-images">I really need two background images :)</div>');
      return;
    }

    // The div element will be filled by JXSlider._onLoaded later
    $container.append('<div class="juxtapose"></div>');

    // TODO: Should we convert this and later stuff to jQuery?
    var element = document.querySelector('.juxtapose');
    addClass(element, 'juxtapose-' + this.sliderID);

    var slider = new JXSlider('.juxtapose-' + this.sliderID, [{
      src: H5P.getPath(this.options.image1.path, this.id),
      label: this.options.label1
    }, {
      src: H5P.getPath(this.options.image2.path, this.id),
      label: this.options.label2
    }], {
      startingPosition: this.options.behavior.startingPosition + '%',
      mode: this.options.behavior.sliderOrientation
    });
  };

  /**
   * Create Graphics.
   *
   * @private
   * @param {object} - properties from options.
   * @return {JXSlider} - slider to attach graphics to.
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
   * @param {object} - DOMelement.
   * @return {object} - object containing width and height.
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

  var getImageDimensions = function (img) {
    var dimensions = {
      width: getNaturalDimensions(img).width,
      height: getNaturalDimensions(img).height,
      aspect: function aspect() {
        return this.width / this.height;
      }
    };
    return dimensions;
  };

  var addClass = function (element, c) {
    if (element.classList) {
      element.classList.add(c);
    }
    else {
      element.className += " " + c;
    }
  };

  var removeClass = function (element, c) {
    element.className = element.className.replace(/(\S+)\s*/g, function (w, match) {
      if (match === c) {
        return '';
      }
      return w;
    }).replace(/^\s+/, '');
  };

  var setText = function (element, text) {
    if (document.body.textContent) {
      element.textContent = text;
    }
    else {
      element.innerText = text;
    }
  };

  var getComputedWidthAndHeight = function (element) {
    if (window.getComputedStyle) {
      return {
        width: parseInt(getComputedStyle(element).width, 10),
        height: parseInt(getComputedStyle(element).height, 10)
      };
    }
    else {
      w = element.getBoundingClientRect().right - element.getBoundingClientRect().left;
      h = element.getBoundingClientRect().bottom - element.getBoundingClientRect().top;
      return {
        width: parseInt(w, 10) || 0,
        height: parseInt(h, 10) || 0
      };
    }
  };

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

  var getLeftPercent = function (slider, input) {
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

  var getTopPercent = function (slider, input) {
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

  var JXSlider = function (selector, images, options) {
    this.selector = selector;
    this.options = options;

    if (images.length == 2) {
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    }
    else {
      console.warn("The images parameter takes two Image objects.");
    }
  };

  JXSlider.prototype = {
    updateSlider: function updateSlider(input) {
      var leftPercent, rightPercent;

      if (this.options.mode === "vertical") {
        leftPercent = getTopPercent(this.slider, input);
      }
      else {
        leftPercent = getLeftPercent(this.slider, input);
      }

      leftPercent = leftPercent.toFixed(2) + "%";
      leftPercentNum = parseFloat(leftPercent);
      rightPercent = 100 - leftPercentNum + "%";

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
    },

    getPosition: function getPosition() {
      return this.sliderPosition;
    },

    displayLabel: function displayLabel(element, labelText) {
      var label = document.createElement("div");
      label.className = 'jx-label';
      label.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document

      setText(label, labelText);
      element.appendChild(label);
    },

    setStartingPosition: function setStartingPosition(s) {
      this.options.startingPosition = s;
    },

    checkImages: function checkImages() {
      if (getImageDimensions(this.imgBefore.image).aspect() == getImageDimensions(this.imgAfter.image).aspect()) {
        return true;
      }
      else {
        return false;
      }
    },

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

    responsivizeIframe: function responsivizeIframe(dims) {
      //Check the slider dimensions against the iframe (window) dimensions
      if (dims.height < window.innerHeight) {
        //If the aspect ratio is greater than 1, imgs are landscape, so letterbox top and bottom
        if (dims.ratio >= 1) {
          this.wrapper.style.paddingTop = parseInt((window.innerHeight - dims.height) / 2) + "px";
        }
      }
      else if (dims.height > window.innerHeight) {
        /* If the image is too tall for the window, which happens at 100% width on large screens,
         * force dimension recalculation based on height instead of width */
        dims = this.calculateDims(0, window.innerHeight);
        this.wrapper.style.paddingLeft = parseInt((window.innerWidth - dims.width) / 2) + "px";
      }
      return dims;
    },

    setWrapperDimensions: function setWrapperDimensions() {
      var wrapperWidth = getComputedWidthAndHeight(this.wrapper).width;
      var wrapperHeight = getComputedWidthAndHeight(this.wrapper).height;
      var dims = this.calculateDims(wrapperWidth, wrapperHeight);
      // if window is in iframe, make sure images don't overflow boundaries
      if (window.location !== window.parent.location) {
        dims = this.responsivizeIframe(dims);
      }

      this.wrapper.style.height = parseInt(dims.height) + "px";
      this.wrapper.style.width = parseInt(dims.width) + "px";
    },

    optimizeWrapper: function optimizeWrapper(maxWidth) {
      if (this.imgBefore.image.naturalWidth >= maxWidth && this.imgAfter.image.naturalWidth >= maxWidth) {
        this.wrapper.style.width = maxWidth + "px";
      }
      else if (this.imgAfter.image.naturalWidth < maxWidth) {
        this.wrapper.style.width = this.imgAfter.image.naturalWidth + "px";
      }
      else {
        this.wrapper.style.width = this.imgBefore.image.naturalWidth + "px";
      }
      this.setWrapperDimensions();
      return result;
    },

    _onLoaded: function _onLoaded() {
      if (this.imgBefore && this.imgBefore.loaded === true && this.imgAfter && this.imgAfter.loaded === true) {

        this.wrapper = document.querySelector(this.selector);

        this.wrapper.style.width = getNaturalDimensions(this.imgBefore.image).width;
        this.setWrapperDimensions();

        this.slider = document.createElement("div");
        this.slider.className = 'jx-slider';
        this.wrapper.appendChild(this.slider);

        if (this.options.mode != "horizontal") {
          addClass(this.slider, this.options.mode);
        }

        this.handle = document.createElement("div");
        this.handle.className = 'jx-handle';

        this.rightImage = document.createElement("div");
        this.rightImage.className = 'jx-image jx-right';
        this.rightImage.appendChild(this.imgAfter.image);

        this.leftImage = document.createElement("div");
        this.leftImage.className = 'jx-image jx-left';
        this.leftImage.appendChild(this.imgBefore.image);

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
      window.addEventListener("resize", function () {
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
          this.removeEventListener('mouseup', arguments.callee);
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

      window.juxtapose.sliders.push(this);
      self.setWrapperDimensions();
    }
  };

  return C;
}(H5P.jQuery);
