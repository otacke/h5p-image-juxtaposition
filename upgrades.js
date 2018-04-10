/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageJuxtaposition'] = (function ($) {
  return {
    1: {
      2: function (parameters, finished, extras) {
        // Set new show title parameter
        if (parameters.title) {
          parameters.behavior = parameters.behavior || {};
          parameters.behavior.showTitle = true;
        }

        // Copy title to new metadata structure if present
        var metadata = {
          title: parameters.title || ((extras && extras.metadata) ? extras.metadata.title : undefined)
        };
        extras.metadata = metadata;

        // Remove old parameter
        delete parameters.title;

        finished(null, parameters, extras);
      }
    }
  };
})(H5P.jQuery);
