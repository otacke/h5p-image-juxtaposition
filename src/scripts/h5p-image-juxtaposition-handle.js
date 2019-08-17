/** Class representing a Slider handle */
class ImageJuxtapositionHandle {
  /**
   * @constructor
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
    this.controller.setAttribute('role', 'slider');
    this.controller.setAttribute('aria-valuemin', 0);
    this.controller.setAttribute('aria-valuemax', 100);

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
      const key = event.which || event.keyCode;
      const positionPercentage = parseFloat(this.handle.style.left || this.handle.style.top);

      // handler left
      if (key === 37) {
        this.callbackUpdate(Math.max(0, positionPercentage - 1));
      }

      // handler right
      if (key === 39) {
        this.callbackUpdate(Math.min(100, positionPercentage + 1));
      }
    });
  }

  /**
   * Get handle DOM.
   * @return {HTMLElement} Handle DOM.
   */
  getDOM() {
    return this.handle;
  }

  /**
   * Update slider position.
   * @param {number} position Position.
   * @param {boolean} [animate=false] Set animated state if true.
   */
  update(position, animate = false) {
    if (animate === true) {
      this.handle.classList.add('transition');
    }
    else {
      this.handle.classList.remove('transition');
    }

    if (this.params.mode === 'horizontal') {
      this.handle.style.left = `${position}%`;
    }
    else {
      this.handle.style.top = `${position}%`;
    }

    this.controller.setAttribute('aria-valuenow', position);
  }
}

export default ImageJuxtapositionHandle;
