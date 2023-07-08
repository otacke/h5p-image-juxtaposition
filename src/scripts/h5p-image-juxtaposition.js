import ImageJuxtapositionSlider from '@scripts/h5p-image-juxtaposition-slider';
import Spinner from '@scripts/h5p-image-juxtaposition-spinner';
import Util from '@scripts/h5p-image-juxtaposition-util';
import Dictionary from '@services/dictionary';

/* This h5p content library was based on ...
 *
 * juxtapose - v1.1.2 - 2015-07-16
 * Copyright (c) 2015 Alex Duner and Northwestern University Knight Lab
 * License: Mozilla Public License 2.0, https://www.mozilla.org/en-US/MPL/2.0/
 * original source code: https://github.com/NUKnightLab/juxtapose
 *
 * ... but now the code has hardly anything in common anymore.
 */

/** Class for utility functions */
class ImageJuxtaposition extends H5P.Question {
  /**
   * @class
   * @param {object} params Parameters from semantics.
   * @param {number} contentId Content Id.
   * @param {object} contentData Content data.
   */
  constructor(params, contentId, contentData) {
    super('image-juxtaposition');

    this.params = Util.extend({
      title: '',
      taskDescription: '',
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
      },
      a11y: {
        imageVisibleMessage: 'Image @percentage % visible'
      }
    }, params);

    this.contentId = contentId;
    this.contentData = contentData;

    // Fill dictionary
    Dictionary.fill({ a11y: this.params.a11y });

    // Polyfill for IE11
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    // Polyfill for IE11
    if (!Element.prototype.closest) {
      Element.prototype.closest = function (selector) {
        let element = this;

        do {
          if (element.matches(selector)) {
            return element;
          }
          element = element.parentElement || element.parentNode;
        } while (element !== null && element.nodeType === 1);

        return null;
      };
    }

    this.on('exitFullScreen', () => {
      this.trigger('resize');
    });
  }

  /**
   * Register DOM elements with H5P.Question.
   */
  registerDomElements() {
    const container = document.createElement('div');
    container.classList.add('h5p-image-juxtaposition-container');

    // Spinner to indicate loading
    this.spinner = new Spinner('h5p-image-juxtaposition-spinner');
    container.appendChild(this.spinner.getDOM());

    // Title bar
    if (this.params.taskDescription) {
      this.taskDescription = document.createElement('div');
      this.taskDescription.classList.add('h5p-image-juxtaposition-task-description');
      this.taskDescription.classList.add('h5p-image-juxtaposition-task-description-none');
      this.taskDescription.innerHTML = this.params.taskDescription;
      container.appendChild(this.taskDescription);
    }

    // Missing image
    if (
      !this.params.imageBefore.imageBefore.params.file || !this.params.imageBefore.imageBefore.params.file.path ||
      !this.params.imageAfter.imageAfter.params.file || !this.params.imageAfter.imageAfter.params.file.path
    ) {
      const message = document.createElement('div');
      message.classList.add('h5p-image-juxtaposition-missing-images');
      message.innerHTML = 'I really need two background images :)';
      container.appendChild(message);
      this.spinner.hide();
    }
    else {
      const content = document.createElement('div');
      content.classList.add('h5p-image-juxtaposition-juxtapose');
      container.appendChild(content);

      // Create the slider
      this.slider = new ImageJuxtapositionSlider(
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
          this.handleLoaded();
        }
      );

      this.on('resize', () => {
        this.containerH5P = container.closest('.h5p-image-juxtaposition');

        // Container may not be ready yet, try again in a bit
        if (!this.containerH5P) {
          clearTimeout(this.resizeTimeout);
          this.resizeTimeout = setTimeout(() => {
            this.trigger('resize');
          }, 100);

          return;
        }
        else if (this.containerH5P.offsetHeight === 0) {
          clearTimeout(this.resizeTimeout);
          this.resizeTimeout = setTimeout(() => {
            this.trigger('resize');
          }, 100);
        }

        setTimeout(() => {
          this.setDimensions(
            this.containerH5P.classList.contains('h5p-fullscreen') ||
            this.containerH5P.classList.contains('h5p-semi-fullscreen')
          );
        }, 0);
      });
    }

    this.setContent(container);
  }

  /**
   * Set dimensions for slider.
   * @param {boolean} isInFullScreen If true, set fullscreen dims, else not.
   */
  setDimensions(isInFullScreen) {
    let taskDescriptionHeight = 0;

    if (this.taskDescription) {
      const styles = window.getComputedStyle(this.taskDescription);
      const margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);
      taskDescriptionHeight = Math.ceil(this.taskDescription.offsetHeight + margin);
    }

    const dimensionsMax = (isInFullScreen) ?
      {
        height: window.innerHeight - taskDescriptionHeight,
        width: window.innerWidth,
      } :
      undefined;

    this.slider.resize(dimensionsMax);
  }

  /**
   * Handle slider loaded.
   */
  handleLoaded() {
    // We can hide the spinner now and show the taskDescription
    this.spinner.hide();

    if (this.taskDescription) {
      this.taskDescription.classList.remove('h5p-image-juxtaposition-task-description-none');
    }

    this.trigger('resize');
  }

  /**
   * Get tasks title.
   * @returns {string} Title.
   */
  getTitle() {
    let raw;
    if (this.contentData && this.contentData.metadata) {
      raw = this.contentData.metadata.title;
    }
    raw = raw || ImageJuxtaposition.DEFAULT_DESCRIPTION;

    return H5P.createTitle(raw);
  }
}

/** @constant {string} */
ImageJuxtaposition.DEFAULT_DESCRIPTION = 'Image Juxtaposition';

export default ImageJuxtaposition;
