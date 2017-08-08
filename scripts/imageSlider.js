/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 *
 * There's not much left of the original code though ...
 */

 // TODO: Clean up code after the removal of onloaded() and init(), will probably be much simpler

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
  ImageJuxtaposition.ImageSlider = function (selector, images, labels, options, parent) {
    var that = this;

    this.selector = selector;
    this.options = options;
    this.parent = parent;

    this.mousedown = false;

    if (images.length !== 2) {
      console.warn("The images parameter takes two Image objects.");
      return;
    }

    this.imgBefore = new Graphic(images[0], labels[0]);
    this.imgAfter = new Graphic(images[1], labels[1]);

    // Create the DOM.
    this.imgBefore.image.classList.add('h5p-image-juxtaposition-leftimg');
    // Prevent dragging, etc. when leaving iframe.
    this.imgBefore.image.setAttribute('draggable', 'false');
    this.imgBefore.image.setAttribute('unselectable', 'on');
    this.imgBefore.image.setAttribute('onselectstart', 'return false;');
    this.imgBefore.image.setAttribute('onmousedown', 'return false;');
    // TODO: Check if we can allow right clicks on image without breaking functionality

    this.leftImage = document.createElement("div");
    this.leftImage.classList.add('h5p-image-juxtaposition-image', 'h5p-image-juxtaposition-left');
    this.leftImage.setAttribute('draggable', 'false');
    this.leftImage.appendChild(this.imgBefore.image);

    if (this.imgBefore.label) {
      var leftLabel = document.createElement("div");
      leftLabel.classList.add('h5p-image-juxtaposition-label');
      leftLabel.setAttribute('unselectable', 'on');
      leftLabel.setAttribute('onselectstart', 'return false;');
      leftLabel.setAttribute('onmousedown', 'return false;');
      leftLabel.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
      leftLabel.innerText = this.imgBefore.label;
      this.leftImage.appendChild(leftLabel);
    }

    this.imgAfter.image.classList.add('h5p-image-juxtaposition-rightimg');
    // Prevent dragging, etc. when leaving iframe.
    this.imgAfter.image.setAttribute('draggable', 'false');
    this.imgAfter.image.setAttribute('unselectable', 'on');
    this.imgAfter.image.setAttribute('onselectstart', 'return false;');
    this.imgAfter.image.setAttribute('onmousedown', 'return false;');

    this.rightImage = document.createElement("div");
    this.rightImage.classList.add('h5p-image-juxtaposition-image', 'h5p-image-juxtaposition-right');
    this.rightImage.setAttribute('draggable', 'false');
    this.rightImage.appendChild(this.imgAfter.image);

    if (this.imgAfter.label) {
      var rightLabel = document.createElement("div");
      rightLabel.classList.add('h5p-image-juxtaposition-label');
      rightLabel.setAttribute('unselectable', 'on');
      rightLabel.setAttribute('onselectstart', 'return false;');
      rightLabel.setAttribute('onmousedown', 'return false;');
      rightLabel.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
      rightLabel.innerText = this.imgAfter.label;
      this.rightImage.appendChild(rightLabel);
    }

    this.leftArrow = document.createElement("div");
    this.leftArrow.classList.add('h5p-image-juxtaposition-arrow', 'h5p-image-juxtaposition-left');
    this.leftArrow.setAttribute('draggable', 'false');
    this.rightArrow = document.createElement("div");
    this.rightArrow.classList.add('h5p-image-juxtaposition-arrow', 'h5p-image-juxtaposition-right');
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
    this.controller.classList.add('h5p-image-juxtaposition-controller');
    this.controller.setAttribute('draggable', 'false');
    this.controller.style.backgroundColor = this.options.sliderColor;
    this.controller.setAttribute('tabindex', 0);
    this.controller.setAttribute('role', 'slider');
    this.controller.setAttribute('aria-valuenow', parseInt(this.options.startingPosition));
    this.controller.setAttribute('aria-valuemin', 0);
    this.controller.setAttribute('aria-valuemax', 100);

    this.control = document.createElement("div");
    this.control.classList.add('h5p-image-juxtaposition-control');
    this.control.setAttribute('draggable', 'false');
    this.control.style.backgroundColor = this.options.sliderColor;
    this.control.appendChild(this.controller);

    this.handle = document.createElement("div");
    this.handle.classList.add('h5p-image-juxtaposition-handle');
    this.handle.setAttribute('draggable', 'false');
    this.handle.appendChild(this.leftArrow);
    this.handle.appendChild(this.control);
    this.handle.appendChild(this.rightArrow);

    this.slider = document.createElement("div");
    this.slider.classList.add('h5p-image-juxtaposition-slider');
    this.slider.classList.add('h5p-image-juxtaposition-' + this.options.mode);
    this.slider.setAttribute('draggable', 'false');
    this.slider.appendChild(this.handle);
    this.slider.appendChild(this.leftImage);
    this.slider.appendChild(this.rightImage);

    this.wrapper = document.querySelector(this.selector);
    this.wrapper.style.width = this.imgBefore.width;
    this.wrapper.appendChild(this.slider);

    if (this.imgBefore.ratio !== this.imgAfter.ratio) {
      console.warn(this, "Check that the two images have the same aspect ratio for the slider to work correctly.");
    }
    this.imageRatio = this.imgBefore.ratio;

    // Resize listener.
    window.addEventListener('resize', function () {
      that.setWrapperDimensions();
    });

    // Event Listeners for Mouse Interface
    // TODO: Check whether this really doesn't work on IE11?
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
    // TODO: Activate pinch gesture if touched with two (or more) fingers
    // TODO: Check on Surface with Edge - said to fail
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

      // Handler left
      // TODO: Get 2nd opinion. Should vertical sliders use up/down and override the usual browser scrolling?
      if (key === 37) {
        position = Math.max(0, ariaValue - 1);
        that.updateSlider(position, false);
        that.controller.setAttribute('aria-valuenow', position);
      }

      // Handler right
      if (key === 39) {
        position = Math.min(100, ariaValue + 1);
        that.updateSlider(position, false);
        that.controller.setAttribute('aria-valuenow', position);
      }
    });

    // Event Listeners for Keyboard on images (Space/Return)
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

      var firstPercent = getFirstPercentage(this.slider, input, this.options.mode);
      firstPercent = parseFloat(firstPercent.toFixed(2));
      var secondPercent = 100 - firstPercent;

      // Set handler position and image areas.
      if (firstPercent > 0 && firstPercent < 100) {
        var handle = document.querySelector('.h5p-image-juxtaposition-handle');
        var left = document.querySelector('.h5p-image-juxtaposition-image.h5p-image-juxtaposition-left');
        var right = document.querySelector('.h5p-image-juxtaposition-image.h5p-image-juxtaposition-right');

        // Add animation effect.
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

        // Set position.
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

      // Update ARIA.
      this.controller.setAttribute('aria-valuenow', firstPercent);
    },

    /**
     * Update the wrapper dimensions
     */
    setWrapperDimensions: function setWrapperDimensions() {
      var maximumWidth, maximumHeight;
      var targetWidth, targetHeight;

      /*
      * Get maximum width and height that can be displayed.
      * Unfortunately, the iPhone requires a special treatment as it doesn't
      * work with the measuring the container, and it also requires individual
      * treatment for landscape and portrait orientation.
      *
      * TODO: Check positioning on iPad after pinching
      */
      if (H5P.isFullscreen) {
        // TODO: Check for iPad and Surface as well => might be an issue, Surface said to lack "exit fullscreen" button on Surface
        if (isMobileDevice() && (/iPhone/.test(navigator.userAgent))) {
          if (Math.abs(window.orientation) === 90) {
            maximumWidth = screen.height;
            maximumHeight = screen.width;
          }
          else {
            maximumWidth = screen.availWidth;
            maximumHeight = screen.availHeight;
          }
        }
        else {
          maximumWidth = parseInt(window.getComputedStyle(this.parent.container).width);
          maximumHeight = parseInt(window.getComputedStyle(this.parent.container).height);
        }
      }
      else {
        // Not full screen.
        maximumWidth = Math.min(this.options.maximumWidth, parseInt(document.querySelector(this.selector).offsetWidth));
        maximumHeight = this.options.maximumHeight;
      }

      // Scale to width or to height, whatever leads to a bigger image.
      var maxRatio = maximumWidth / maximumHeight;
      if (maxRatio <= this.imageRatio) {
        // TODO: Check whether flooring causes the bug -> should ...
        targetWidth = Math.min(Math.floor(window.innerWidth), maximumWidth);
        targetHeight = Math.round(targetWidth / this.imageRatio);
      }
      else {
        targetHeight = maximumHeight;
        targetWidth = Math.round(targetHeight * this.imageRatio);
      }

      // Add passepartout - we don't need one at the top/bottom if not on fullscreen.
      if (H5P.isFullscreen) {
        this.wrapper.style.paddingTop = Math.floor((maximumHeight - targetHeight) / 2) + 'px ';
        this.wrapper.style.paddingBottom = this.wrapper.style.paddingTop;
        this.wrapper.style.paddingLeft = Math.floor((maximumWidth - targetWidth) / 2) + 'px';
        this.wrapper.style.paddingRight = this.wrapper.style.paddingLeft;
      } else {
        this.wrapper.style.paddingTop = 0;
        this.wrapper.style.paddingBottom = 0;
        this.wrapper.style.paddingLeft = Math.floor((window.innerWidth - targetWidth) / 2) + 'px';
        this.wrapper.style.paddingRight = this.wrapper.style.paddingLeft;
      }

      this.wrapper.style.height = targetHeight + 'px';

      // The InternetExplorer needs this explicit width and height for images.
      this.imgBefore.image.setAttribute('width', targetWidth);
      this.imgBefore.image.setAttribute('height', targetHeight);
      this.imgAfter.image.setAttribute('width', targetWidth);
      this.imgAfter.image.setAttribute('height', targetHeight);

      // Resize iframe if image's height is too small or too high.
      // TODO: Does this fail in IE11 on reload?
      var windowHeight = window.innerHeight;
      var titleHeight = (document.querySelector('.h5p-image-juxtaposition-title')) ? document.querySelector('.h5p-image-juxtaposition-title').offsetHeight : 0;
      var actionBar = document.querySelector('.h5p-actions');
      var actionBarHeight = actionBar ? actionBar.offsetHeight : -1;
      if (titleHeight + targetHeight + actionBarHeight + 1 !== windowHeight) {
        this.parent.trigger('resize');
      }
    },
  };

  /**
   * Create Graphics.
   *
   * @private
   * @param {object} properties - From options.
   * @param {ImageSlider} slider - Slider to attach graphics to.
   */
  var Graphic = function (image, label) {
    var that = this;
    this.image = image;
    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
    this.ratio = this.width / this.height;
    this.label = label || false;
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

  /**
   * Detect mobile devices (http://detectmobilebrowsers.com/)
   *
   * @returns {boolean} True if running on a mobile device.
   */
  var isMobileDevice = function() {
    var check = false;
    (function(a){
      if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;}) (navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

})(H5P.ImageJuxtaposition);
