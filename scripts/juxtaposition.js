/*
 * TODO: create code
 * TODO: style the output
 * TODO: make options look nicer, e.g. with a list of exactly 2 items
 * TODO: implement fullscreen mode, https://h5p.org/using-fullscreen
 */
var H5P = H5P || {};

H5P.ImageJuxtaposition = (function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      title: '',
      image1: null,
      label1: null,
      image2: null,
      label2: null
    }, options);
    this.id = id;
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

    // Just for testing ...
    if (this.options.image1 && this.options.image1.path) {
      $container.append('<img class="image-1" src="' + H5P.getPath(this.options.image1.path, this.id) + '">');
    }
    if (this.options.image2 && this.options.image2.path) {
      $container.append('<img class="image-2" src="' + H5P.getPath(this.options.image2.path, this.id) + '">');
    }
  };

  return C;
})(H5P.jQuery);
