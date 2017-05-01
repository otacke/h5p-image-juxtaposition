/* This h5p content library is based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 *
 * There's not much left of the original code though ...
 */
var H5P = H5P || {};

H5P.ImageJuxtaposition = function ($) {
  /**
   * Constructor function.
   *
   * @param {object} options from semantics.json.
   * @param {number} content id.
   */
  function ImageJuxtaposition(options, id) {
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
  ImageJuxtaposition.prototype = Object.create(H5P.EventDispatcher.prototype);
  ImageJuxtaposition.prototype.constructor = ImageJuxtaposition;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} container to attach to.
   */
  ImageJuxtaposition.prototype.attach = function ($container) {
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

    // The div element will be filled by Slider._onLoaded later
    var wrapper = document.createElement('div');
    wrapper.className = 'h5p-image-juxtaposition-juxtapose';
    container.appendChild(wrapper);

    // Create the slider
    var slider = new H5P.ImageJuxtaposition.ImageSlider('.h5p-image-juxtaposition-juxtapose', [{
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
  };

  return ImageJuxtaposition;
}(H5P.jQuery);
