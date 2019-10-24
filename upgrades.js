/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageJuxtaposition'] = (function () {
  return {
    1: {
      2: function (parameters, finished, extras) {

        var hasMetadataTitle = (extras && extras.metadata && extras.metadata.title);

        finished(null, parameters, {
          metadata: {
            title: hasMetadataTitle ? extras.metadata.title : parameters.title
          }
        });
      },
      4: function (parameters, finished, extras) {

        var newImage;

        // First image
        if (parameters.imageBefore && parameters.imageBefore.imageBefore) {
          // Create new image structure
          newImage = {
            library: 'H5P.Image 1.1',
            // We avoid using H5P.createUUID since this is an upgrade script and H5P function may change
            subContentId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
              var random = Math.random() * 16 | 0, newChar = char === 'x' ? random : (random & 0x3 | 0x8);
              return newChar.toString(16);
            }),
            params: {
              alt: (parameters.imageBefore && parameters.imageBefore.labelBefore) ? parameters.imageBefore.labelBefore : undefined,
              contentName: 'Image',
              file: parameters.imageBefore.imageBefore
            }
          };
        }
        parameters.imageBefore.imageBefore = newImage;

        // Second image
        if (parameters.imageAfter && parameters.imageAfter.imageAfter) {
          // Create new image structure
          newImage = {
            library: 'H5P.Image 1.1',
            // We avoid using H5P.createUUID since this is an upgrade script and H5P function may change
            subContentId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
              var random = Math.random() * 16 | 0, newChar = char === 'x' ? random : (random & 0x3 | 0x8);
              return newChar.toString(16);
            }),
            params: {
              alt: (parameters.imageAfter && parameters.imageAfter.labelAfter) ? parameters.imageAfter.labelAfter : undefined,
              contentName: 'Image',
              file: parameters.imageAfter.imageAfter
            }
          };
        }
        parameters.imageAfter.imageAfter = newImage;

        finished(null, parameters, extras);
      }
    }
  };
})();
