var H5P = H5P || {};

H5P.ImageJuxtaposition = function ($) {
  'use strict';

  /**
   * Constructor function.
   *
   * @param {object} options - Options from semantics.json.
   * @param {number} content - Id.
   */
  function ImageJuxtaposition(options, id) {
    this.options = sanitizeOptions(options);
    this.id = id;

    // Initialize event inheritance
    H5P.EventDispatcher.call(this);
  }

  // Extends the event dispatcher
  ImageJuxtaposition.prototype = Object.create(H5P.EventDispatcher.prototype);
  ImageJuxtaposition.prototype.constructor = ImageJuxtaposition;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container - Container to attach to.
   */
  ImageJuxtaposition.prototype.attach = function ($container) {
    this.container = $container.get(0);
    this.container.className = 'h5p-image-juxtaposition';

    if (this.options.title) {
      this.title = document.createElement('div');
      this.title.className = 'h5p-image-juxtaposition-title';
      this.title.innerHTML = '<h2>' + this.options.title + '</h2>';
      this.container.appendChild(this.title);
    }

    if (!this.options.imageBefore  || !this.options.imageAfter) {
      var message = document.createElement('div');
      message.className = 'h5p-image-juxtaposition-missing-images';
      message.innerHTML = 'I really need two background images :)';
      this.container.appendChild(message);
      return;
    }

    // The div element will be filled by Slider._onLoaded later
    var wrapper = document.createElement('div');
    wrapper.className = 'h5p-image-juxtaposition-juxtapose';
    this.container.appendChild(wrapper);

    // Create the slider
    var slider = new H5P.ImageJuxtaposition.ImageSlider('.h5p-image-juxtaposition-juxtapose', [{
      src: H5P.getPath(this.options.imageBefore.path, this.id),
      label: this.options.labelBefore
    }, {
      src: H5P.getPath(this.options.imageAfter.path, this.id),
      label: this.options.labelAfter
    }], {
      startingPosition: this.options.startingPosition + '%',
      mode: this.options.sliderOrientation,
      sliderColor: this.options.sliderColor,
      maximumWidth: this.options.maximumWidth,
      maximumHeight: this.options.maximumHeight
    }, this);

    // In Fullscreen mode, don't show the title.
    this.on('enterFullScreen', function() {
      if (this.title) {
        this.title.style.display = 'none';
      }
    });
    this.on('exitFullScreen', function() {
      if (this.title) {
        this.title.style.display = '';
      }
    });
  };

  /**
   * Sanitize the options.
   *
   * @param {object} options - Options from semantics.json.
   * @return {object} output - Sanitized options.
   */
  var sanitizeOptions = function (options) {
    var output = {};

    output.title = options.title || '';
    output.imageBefore = options.imageBefore.imageBefore;
    output.labelBefore = options.imageBefore.labelBefore || '';
    output.imageAfter = options.imageAfter.imageAfter;
    output.labelAfter = options.imageAfter.labelAfter || '';
    output.startingPosition = options.behavior.startingPosition || 50;
    output.sliderOrientation = options.behavior.sliderOrientation || 'horizontal';
    output.sliderColor = options.behavior.sliderColor || '#f3f3f3';
    output.maximumWidth = options.behavior.maximumWidth || screen.width;
    output.maximumHeight = options.behavior.maximumHeight || screen.height;

    return output;
  };

  return ImageJuxtaposition;
}(H5P.jQuery);
