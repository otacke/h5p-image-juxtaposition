import ImageJuxtapositionSlider from './h5p-image-juxtaposition-slider';
import Spinner from './h5p-image-juxtaposition-spinner';
import Util from './h5p-image-juxtaposition-util';

/* This h5p content library is loosely based on ...
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 */

class ImageJuxtaposition extends H5P.Question {
  constructor(params, contentId, contentData) {
    super('image-juxtaposition');

    this.params = Util.extend({
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
        sliderOrientation: 'horizontal',
        sliderColor: '#f3f3f3'
      }
    }, params);

    this.contentId = contentId;
    this.contentData = contentData;

    this.registerDomElements = () => {
      const container = document.createElement('div');
      container.classList.add('h5p-image-juxtaposition-container');

      // Spinner to indicate loading
      this.spinner = new Spinner('h5p-image-juxtaposition-spinner');
      container.appendChild(this.spinner.getDOM());

      // Title bar
      if (this.params.title) {
        const title = document.createElement('div');
        title.classList.add('h5p-image-juxtaposition-title');
        title.innerHTML = this.params.title;
        container.appendChild(title);
      }

      // Missing image
      if (typeof this.params.imageBefore.imageBefore === 'undefined' || typeof this.params.imageAfter.imageAfter === 'undefined') {
        const message = document.createElement('div');
        message.classList.add('h5p-image-juxtaposition-missing-images');
        message.innerHTML = 'I really need two background images :)';
        container.appendChild(message);
      }
      else {
        // The div element will be filled by JXSlider._onLoaded later
        const content = document.createElement('div');
        content.classList.add('h5p-image-juxtaposition-juxtapose');
        container.appendChild(content);

        // Create the slider
        const slider = new ImageJuxtapositionSlider(
          {
            container: content,
            images: [
              {
                src: H5P.getPath(this.params.imageBefore.imageBefore.params.file.path, this.contentId),
                alt: this.params.imageBefore.imageBefore.params.alt,
                title: this.params.imageBefore.imageBefore.params.title,
                label: this.params.imageBefore.labelBefore
              },
              {
                src: H5P.getPath(this.params.imageAfter.imageAfter.params.file.path, this.contentId),
                alt: this.params.imageAfter.imageAfter.params.alt,
                title: this.params.imageAfter.imageAfter.params.title,
                label: this.params.imageAfter.labelAfter
              }
            ],
            startingPosition: this.params.behavior.startingPosition + '%',
            mode: this.params.behavior.sliderOrientation,
            color: this.params.behavior.sliderColor
          },
          () => {
            // We can hide the spinner now
            this.spinner.hide();

            // TODO: Find a way to get rid of that extra resize
            this.trigger('resize');
            setTimeout(() => {
              this.trigger('resize');
            }, 1); // At least Firefox needs 1 instead of 0
          }
        );

        this.on('resize', () => {
          slider.setWrapperDimensions();
        });

        // This is needed for Chrome to detect the mouseup outside the iframe
        window.addEventListener('mouseup', function () {
          slider.mouseup();
        });
      }

      this.setContent(container);
    };

    /**
     * Get tasks title.
     * @return {string} Title.
     */
    this.getTitle = () => {
      let raw;
      if (this.contentData && this.contentData.metadata) {
        raw = this.contentData.metadata.title;
      }
      raw = raw || ImageJuxtaposition.DEFAULT_DESCRIPTION;

      return H5P.createTitle(raw);
    };
  }
}

/** @constant {string} */
ImageJuxtaposition.DEFAULT_DESCRIPTION = 'Image Juxtaposition';

export default ImageJuxtaposition;