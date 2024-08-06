import { PERCENTAGE_MIN, PERCENTAGE_MAX } from '@services/constants.js';

/** @constant {number} READ_TIMEOUT_MS Screen reader delay. */
const READ_TIMEOUT_MS = 10;

/** @constant {number} CHROMEVOX_FOCUS_DELAY_MS Workaround delay for ChromeVox plugin. */
const CHROMEVOX_FOCUS_DELAY_MS = 100;

/** Class representing a Slider handle */
class ImageJuxtapositionHandle {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {string} params.color Handle color as #xxxxxx.
   * @param {string} params.mode Slider direction.
   * @param {function} callbackUpdate Callback for slider updates.
   */
  constructor(params, callbackUpdate) {
    this.params = params;
    this.callbackUpdate = callbackUpdate;

    // Controller that can be moved
    this.controller = document.createElement('div');
    this.controller.className = 'h5p-image-juxtaposition-controller';
    this.controller.style.backgroundColor = this.params.color;
    this.controller.setAttribute('draggable', 'false');
    this.controller.setAttribute('tabindex', 0);
    this.controller.setAttribute('role', 'separator');
    this.controller.setAttribute('aria-valuemin', PERCENTAGE_MIN);
    this.controller.setAttribute('aria-valuemax', PERCENTAGE_MAX);
    this.controller.setAttribute('aria-orientation', this.params.mode);

    // Bar (horizontal or vertical)
    const bar = document.createElement('div');
    bar.className = 'h5p-image-juxtaposition-control';
    bar.style.backgroundColor = this.params.color;
    bar.setAttribute('draggable', 'false');
    bar.appendChild(this.controller);

    // Left arrow
    const leftArrow = document.createElement('div');
    leftArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-left';
    leftArrow.style.borderColor = (this.params.mode === 'horizontal') ?
      `transparent ${this.params.color} transparent transparent` :
      `transparent transparent ${this.params.color} transparent`;
    leftArrow.setAttribute('draggable', 'false');

    // Right arrow
    const rightArrow = document.createElement('div');
    rightArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-right';
    rightArrow.style.borderColor = (this.params.mode === 'horizontal') ?
      `transparent transparent transparent ${this.params.color}` :
      `${this.params.color} transparent transparent transparent`;
    rightArrow.setAttribute('draggable', 'false');

    // Complete handle
    this.handle = document.createElement('div');
    this.handle.className = 'h5p-image-juxtaposition-handle';
    this.handle.setAttribute('draggable', 'false');
    this.handle.appendChild(leftArrow);
    this.handle.appendChild(bar);
    this.handle.appendChild(rightArrow);

    // Event Listeners for keyboard
    this.handle.addEventListener('keydown', (event) => {
      event = event || window.event;

      const positionPercentage = parseFloat(this.handle.style.left || this.handle.style.top);

      /*
       * Technically, this is a slider with just two positions, so jumping from
       * 0% to 100% (image 1 and 2) and vice versa meets the ARIA recommendation
       * https://www.w3.org/TR/wai-aria-practices/#slider, but the implementation
       * also offers users without a visual deficiency to go to intermediate
       * positions.
       */
      if (
        event.shiftKey &&
          (event.code === 'ArrowLeft' || event.code === 'ArrowUp')
      ) {
        event.preventDefault();
        this.callbackUpdate(Math.max(PERCENTAGE_MIN, positionPercentage - 1));
      }
      else if (
        event.shiftKey &&
          (event.code === 'ArrowRight' || event.code === 'ArrowDown')
      ) {
        event.preventDefault();
        this.callbackUpdate(Math.min(positionPercentage + 1, PERCENTAGE_MAX));
      }
      else if (
        event.code === 'Home' ||
        event.code === 'ArrowLeft' ||
        event.code === 'ArrowUp'
      ) {
        event.preventDefault();
        this.callbackUpdate(PERCENTAGE_MIN);
      }
      else if (
        event.code === 'End' ||
        event.code === 'ArrowRight' ||
        event.code === 'ArrowDown'
      ) {
        event.preventDefault();
        this.callbackUpdate(PERCENTAGE_MAX);
      }
    });
  }

  /**
   * Get handle DOM.
   * @returns {HTMLElement} Handle DOM.
   */
  getDOM() {
    return this.handle;
  }

  /**
   * Update slider position.
   * @param {number} position Position.
   * @param {boolean} [animate] Set animated state if true.
   */
  update(position, animate = false) {
    if (animate === true) {
      this.handle.classList.add('transition');
    }
    else {
      this.handle.classList.remove('transition');
    }

    this.controller.setAttribute('aria-valuenow', parseInt(position));

    if (this.params.mode === 'horizontal') {
      this.handle.style.left = `${position}%`;
    }
    else {
      this.handle.style.top = `${position}%`;
    }

    this.setAriaControls(position);
    this.setAriaValueText(position);
  }

  /**
   * Set aria controls.
   * @param {number} position Position of handle.
   */
  setAriaControls(position) {
    if (typeof position !== 'number') {
      position = (this.params.mode === 'horizontal') ?
        parseFloat(this.handle.style.left) :
        parseFloat(this.handle.style.top);
    }

    if (typeof position !== 'number') {
      return;
    }

    this.controller.setAttribute(
      'aria-controls',
      position >= PERCENTAGE_CENTER ? this.params.ids[0] : this.params.ids[1]
    );
  }

  /**
   * Set aria value text - for `separator` role that's a aria-label.
   * @param {number} position Position to set to.
   */
  setAriaValueText(position) {
    if (typeof position !== 'number') {
      position = (this.params.mode === 'horizontal') ?
        parseFloat(this.handle.style.left) :
        parseFloat(this.handle.style.top);
    }

    let ariaValueText;
    if (parseInt(position) >= PERCENTAGE_CENTER) {
      const alt = this.params.ariaValueTextBefore;
      const message = this.params.dictionary.get('a11y.imageVisibleMessage')
        .replace(/@percentage/, Math.round(position));

      ariaValueText = `${alt}. ${message}`;
    }
    else {
      const alt = this.params.ariaValueTextAfter;
      const message = this.params.dictionary.get('a11y.imageVisibleMessage')
        .replace(/@percentage/, PERCENTAGE_MAX - Math.round(position));

      ariaValueText = `${alt}. ${message}`;
    }

    this.controller.setAttribute('aria-label', ''); // Needed for re-reading
    clearTimeout(this.updateReadTimeout);
    this.updateReadTimeout = setTimeout(() => {
      this.controller.setAttribute('aria-label', ariaValueText);
    }, READ_TIMEOUT_MS); // Needed for re-reading
  }

  /**
   * Focus controller.
   */
  focus() {
    setTimeout(() => {
      this.controller.blur(); // Workaround for ChromeVox that steals focus
      this.controller.focus();
    }, CHROMEVOX_FOCUS_DELAY_MS); // Workaround for ChromeVox that steals focus
  }
}

export default ImageJuxtapositionHandle;
