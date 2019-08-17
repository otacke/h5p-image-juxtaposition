import ImageJuxtapositionImage from './h5p-image-juxtaposition-image';

class ImageJuxtapositionSlider {
  constructor(params, callbackLoaded) {
  // constructor(container, images, options, parent) {
    this.params = params;
    this.callbackLoaded = callbackLoaded;
    this.animate = false;

    this.isLoaded = 0;

    this.buildDOM();

    this.leftImage = new ImageJuxtapositionImage(
      {
        image: this.params.images[0],
        label: 'LABEL',
        position: 'left',
      },
      (imageDOM) => {
        this.leftImageDOM.parentNode.replaceChild(imageDOM, this.leftImageDOM);
        this.leftImageDOM = imageDOM;
        this.isLoaded++;
        this._onLoaded();
      }
    );

    this.rightImage = new ImageJuxtapositionImage(
      {
        image: this.params.images[1],
        label: 'LABEL 2',
        position: 'right',
      },
      (imageDOM) => {
        this.rightImageDOM.parentNode.replaceChild(imageDOM, this.rightImageDOM);
        this.rightImageDOM = imageDOM;
        this.isLoaded++;
        this._onLoaded();
      }
    );
  }

  buildDOM() {
    // Slider
    this.slider = document.createElement('div');
    this.slider.className = 'h5p-image-juxtaposition-slider';
    this.slider.classList.add('h5p-image-juxtaposition-' + this.params.mode);
    this.slider.setAttribute('draggable', 'false');
    this.params.container.appendChild(this.slider);

    // Slider->Handle
    this.handle = document.createElement('div');
    this.handle.className = 'h5p-image-juxtaposition-handle';
    this.handle.setAttribute('draggable', 'false');
    this.slider.appendChild(this.handle);

    this.leftImageDOM = document.createElement('div');
    this.slider.appendChild(this.leftImageDOM);

    this.rightImageDOM = document.createElement('div');
    this.slider.appendChild(this.rightImageDOM);
  }

  updateSlider(input, animate) {
    let leftPercent, rightPercent, leftPercentNum;

    if (this.params.mode === 'vertical') {
      leftPercent = this.getTopPercent(this.slider, input);
    }
    else {
      leftPercent = this.getLeftPercent(this.slider, input);
    }

    leftPercent = leftPercent.toFixed(2) + '%';
    leftPercentNum = parseFloat(leftPercent);
    rightPercent = 100 - leftPercentNum + '%';

    // set handler position and image areas
    if (leftPercentNum > 0 && leftPercentNum < 100) {
      // add animation effect
      if (animate === true) {
        this.handle.classList.add('transition');
        this.leftImageDOM.classList.add('transition');
        this.rightImageDOM.classList.add('transition');
      }
      else {
        this.handle.classList.remove('transition');
        this.leftImageDOM.classList.remove('transition');
        this.rightImageDOM.classList.remove('transition');
      }

      if (this.params.mode === 'vertical') {
        this.handle.style.top = leftPercent;
        this.leftImageDOM.style.height = leftPercent;
        this.rightImageDOM.style.height = rightPercent;
      }
      else {
        this.handle.style.left = leftPercent;
        this.leftImageDOM.style.width = leftPercent;
        this.rightImageDOM.style.width = rightPercent;
      }
      this.sliderPosition = leftPercent;
    }

    // update aria
    this.controller.setAttribute('aria-valuenow', leftPercentNum);
  }

  setWrapperDimensions() {
    const targetWidth = window.innerWidth - 2;
    const targetHeight = targetWidth / this.imageRatio;

    if (this.params.container) {
      this.params.container.style.width = targetWidth + 'px';
      this.params.container.style.height = targetHeight + 'px';
    }
  }

  _onLoaded() {
    if (this.isLoaded < 2) {
      return;
    }

    const dimensions = [this.leftImage.getDimensions(), this.rightImage.getDimensions()];
    if (dimensions[0].ratio !== dimensions[1].ratio) {
      console.warn('Make sure that both images have the same aspect ratio.');
    }

    this.imageRatio = dimensions[0].ratio;
    this.params.container.style.width = dimensions[0].width;

    this.leftArrow = document.createElement('div');
    this.rightArrow = document.createElement('div');
    this.control = document.createElement('div');
    this.controller = document.createElement('div');

    this.leftArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-left';
    this.leftArrow.style.borderColor = `transparent ${this.params.color} transparent transparent`;
    this.leftArrow.setAttribute('draggable', 'false');
    this.rightArrow.className = 'h5p-image-juxtaposition-arrow h5p-image-juxtaposition-right';
    this.rightArrow.style.borderColor = `transparent transparent transparent ${this.params.color}`;
    this.rightArrow.setAttribute('draggable', 'false');
    this.control.className = 'h5p-image-juxtaposition-control';
    this.control.style.backgroundColor = this.params.color;
    this.control.setAttribute('draggable', 'false');
    this.controller.className = 'h5p-image-juxtaposition-controller';
    this.controller.style.backgroundColor = this.params.color;
    this.controller.setAttribute('draggable', 'false');

    this.controller.setAttribute('tabindex', 0); //put the controller in the natural tab order of the document
    this.controller.setAttribute('role', 'slider');
    this.controller.setAttribute('aria-valuenow', parseInt(this.params.startingPosition));
    this.controller.setAttribute('aria-valuemin', 0);
    this.controller.setAttribute('aria-valuemax', 100);

    this.handle.appendChild(this.leftArrow);
    this.handle.appendChild(this.control);
    this.handle.appendChild(this.rightArrow);
    this.control.appendChild(this.controller);

    this._init();
  }

  getLeftPercent(slider, input) {
    let leftPercent;
    if (typeof input === 'string' || typeof input === 'number') {
      leftPercent = parseInt(input, 10);
    }
    else {
      const sliderRect = slider.getBoundingClientRect();
      const offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      const width = slider.offsetWidth;
      const pageX = this.getPageX(input);
      const relativeX = pageX - offset.left;
      leftPercent = relativeX / width * 100;
    }
    if (leftPercent === 0) {
      leftPercent = 0.01;
    }
    if (leftPercent === 100) {
      leftPercent = 99.99;
    }
    return leftPercent;
  }

  getPageX(e) {
    let pageX;
    if (e.pageX) {
      pageX = e.pageX;
    }
    else if (e.touches) {
      pageX = e.touches[0].pageX;
    }
    else {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    }
    return pageX;
  }

  getPageY(e) {
    let pageY;
    if (e.pageY) {
      pageY = e.pageY;
    }
    else if (e.touches) {
      pageY = e.touches[0].pageY;
    }
    else {
      pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return pageY;
  }

  getTopPercent(slider, input) {
    let topPercent;
    if (typeof input === 'string' || typeof input === 'number') {
      topPercent = parseInt(input, 10);
    }
    else {
      const sliderRect = slider.getBoundingClientRect();
      const offset = {
        top: sliderRect.top + document.body.scrollTop,
        left: sliderRect.left + document.body.scrollLeft
      };
      const width = slider.offsetHeight;
      const pageY = this.getPageY(input);
      const relativeY = pageY - offset.top;
      topPercent = relativeY / width * 100;
    }
    if (topPercent === 0) {
      topPercent = 0.01;
    }
    if (topPercent === 100) {
      topPercent = 99.99;
    }
    return topPercent;
  }

  mouseup() {
    this.slider.dispatchEvent(new CustomEvent('mouseup'));
  }

  _init() {
    const self = this;

    // Event Listeners for Mouse Interface
    this.slider.addEventListener('mousedown', function (e) {
      e = e || window.event;
      // Don't use preventDefault or Firefox won't detect mouseup outside the iframe.
      self.updateSlider(e, true);
      this.animate = true;
    });

    this.slider.addEventListener('mousemove', function (e) {
      e = e || window.event;
      e.preventDefault();
      if (this.animate === true) {
        self.updateSlider(e, false);
      }
    });

    this.slider.addEventListener('mouseup', function (e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      this.animate = false;
    });

    // Event Listeners for Touch Interface
    this.slider.addEventListener('touchstart', function (e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      self.updateSlider(e, true);

      this.addEventListener('touchmove', function (e) {
        e = e || window.event;
        e.preventDefault();
        e.stopPropagation();
        self.updateSlider(e, false);
      });
    });

    // Event Listeners for Keyboard on handle
    this.handle.addEventListener('keydown', function (e) {
      e = e || window.event;
      const key = e.which || e.keyCode;
      const ariaValue = parseFloat(this.style.left || this.style.top);
      let position = 0;

      // handler left
      if (key === 37) {
        position = Math.max(0, ariaValue - 1);
        self.updateSlider(position, false);
        self.controller.setAttribute('aria-valuenow', position);
      }

      // handler right
      if (key === 39) {
        position = Math.min(100, ariaValue + 1);
        self.updateSlider(position, false);
        self.controller.setAttribute('aria-valuenow', position);
      }
    });

    // Event Listeners for Keyboard on images
    this.leftImageDOM.addEventListener('keydown', function (e) {
      const key = e.which || e.keyCode;
      if ((key === 13) || (key === 32)) {
        self.updateSlider('90%', true);
        self.controller.setAttribute('aria-valuenow', 90);
      }
    });

    this.rightImageDOM.addEventListener('keydown', function (e) {
      const key = e.which || e.keyCode;
      if ((key === 13) || (key === 32)) {
        self.updateSlider('10%', true);
        self.controller.setAttribute('aria-valuenow', 10);
      }
    });

    self.updateSlider(this.params.startingPosition, false);

    this.callbackLoaded();
  }
}

export default ImageJuxtapositionSlider;
