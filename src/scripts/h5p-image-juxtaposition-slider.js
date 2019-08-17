import ImageJuxtapositionImage from './h5p-image-juxtaposition-image';
import ImageJuxtapositionHandle from './h5p-image-juxtaposition-handle';

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
        this.handleImageLoaded();
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
        this.handleImageLoaded();
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
    this.handle = new ImageJuxtapositionHandle(
      {
        color: this.params.color
      },
      (position) => {
        this.updateSlider(position);
      }
    );
    this.slider.appendChild(this.handle.getDOM());

    this.leftImageDOM = document.createElement('div');
    this.slider.appendChild(this.leftImageDOM);

    this.rightImageDOM = document.createElement('div');
    this.slider.appendChild(this.rightImageDOM);
  }

  updateSlider(input, animate = false) {
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
        this.handle.getDOM().classList.add('transition');
        this.leftImageDOM.classList.add('transition');
        this.rightImageDOM.classList.add('transition');
      }
      else {
        this.handle.getDOM().classList.remove('transition');
        this.leftImageDOM.classList.remove('transition');
        this.rightImageDOM.classList.remove('transition');
      }

      if (this.params.mode === 'vertical') {
        this.handle.getDOM().style.top = leftPercent;
        this.leftImageDOM.style.height = leftPercent;
        this.rightImageDOM.style.height = rightPercent;
      }
      else {
        this.handle.getDOM().style.left = leftPercent;
        this.leftImageDOM.style.width = leftPercent;
        this.rightImageDOM.style.width = rightPercent;
      }
      this.sliderPosition = leftPercent;
    }

    // update aria
    this.handle.update(leftPercentNum);
  }

  setWrapperDimensions() {
    const targetWidth = window.innerWidth - 2;
    const targetHeight = targetWidth / this.imageRatio;

    if (this.params.container) {
      this.params.container.style.width = targetWidth + 'px';
      this.params.container.style.height = targetHeight + 'px';
    }
  }

  handleImageLoaded() {
    if (this.isLoaded < 2) {
      return;
    }

    const dimensions = [this.leftImage.getDimensions(), this.rightImage.getDimensions()];
    if (dimensions[0].ratio !== dimensions[1].ratio) {
      console.warn('Make sure that both images have the same aspect ratio.');
    }

    this.imageRatio = dimensions[0].ratio;
    this.params.container.style.width = dimensions[0].width;

    this.addEventListeners();
    this.updateSlider(this.params.startingPosition, false);

    this.callbackLoaded();
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

  /**
   * Add event listeners.
   */
  addEventListeners() {
    // Event Listeners for Mouse Interface
    this.slider.addEventListener('mousedown', (event) => {
      event = event || window.event;
      // Don't use preventDefault or Firefox won't detect mouseup outside the iframe.
      this.updateSlider(event, true);
      this.animate = true;
    });

    this.slider.addEventListener('mousemove', (event) => {
      event = event || window.event;
      event.preventDefault();
      if (this.animate === true) {
        this.updateSlider(event, false);
      }
    });

    this.slider.addEventListener('mouseup', (event) => {
      event = event || window.event;
      event.preventDefault();
      event.stopPropagation();
      this.animate = false;
    });

    // Event Listeners for Touch Interface
    this.slider.addEventListener('touchstart', (event) => {
      event = event || window.event;
      event.preventDefault();
      event.stopPropagation();
      this.updateSlider(event, true);
    });

    this.slider.addEventListener('touchmove', (event) => {
      event = event || window.event;
      event.preventDefault();
      event.stopPropagation();
      this.updateSlider(event, false);
    });
  }
}

export default ImageJuxtapositionSlider;
