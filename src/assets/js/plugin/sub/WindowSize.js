import { clearSelection, createFrameMove } from "./WindowMove";

function setPositionAllPoints(window,points){
  if(!points){
    points = window.querySelectorAll('.window-size-point');
    if(!points.length){
      const wsize = new WindowSize();
      wsize.attach(window);
    }
  }
  const rect = window.getBoundingClientRect();
  points[0].style.top = '0px';
  points[0].style.left = '0px';
  points[1].style.top = '0px';
  points[1].style.left = (rect.width - 10) + 'px';
  points[2].style.top = (rect.height - 10) + 'px';
  points[2].style.left = (rect.width - 10) + 'px';
  points[3].style.top = (rect.height - 10) + 'px';
  points[3].style.left = '0px';
}

export {setPositionAllPoints};

/**
 * HOW TO USE:
 * 1. const el = document.querySelector('#window'); // biasanya yang dibuat dengan class WindowTask saat mounting vue app
 * 2. const wsize = new WindowSize();
 * 3. wsize.attach(el);
 */
export default class WindowSize {

  attach(windowElement) {
    const points = [];
    for (let i = 0; i < 4; i++) {
      points[i] = windowElement.ownerDocument.createElement('div');
      points[i].style.position = 'absolute';
      points[i].style.height = '10px';
      points[i].style.width = '10px';
      points[i].style.backgroundColor = 'blue';
      points[i].style.zIndex = '100';
      points[i].style.backgroundColor = 'transparent';
      points[i].classList.add('window-size-point');

      switch (i) {
        case 0:
          points[i].classList.add('window-size-point-satu');
          points[i].addEventListener('pointerdown', this.onpointerdown.bind(this, windowElement, 0))
          break;
        case 1:
          points[i].classList.add('window-size-point-dua');
          points[i].addEventListener('pointerdown', this.onpointerdown.bind(this, windowElement, 1))
          break;
        case 2:
          points[i].classList.add('window-size-point-tiga');
          points[i].addEventListener('pointerdown', this.onpointerdown.bind(this, windowElement, 2))
          break;
        case 3:
          points[i].classList.add('window-size-point-empat');
          points[i].addEventListener('pointerdown', this.onpointerdown.bind(this, windowElement, 3))
          break;
      }
      windowElement.appendChild(points[i]);
    }
    setPositionAllPoints(windowElement, points);
  }

  setSizePoint0(target, rect, pointerupX, pointerupY) {
    const x1 = rect.x;
    const y1 = rect.y;
    const x2 = pointerupX;
    const y2 = pointerupY;
    
    const t = (y1-y2 < 0 ? y1+(y2-y1) : y2);
    const l = (x1-x2 < 0 ? x1+(x2-x1) : x2);
    const w = rect.width + (x1-x2);
    const h = rect.height + (y1-y2);
    
    target.style.top = t + 'px';
    target.style.left = l + 'px';
    target.style.width = w + 'px';
    target.style.height = h + 'px';
  }
  setSizePoint1(target, rect, pointerupX, pointerupY) {
    const x1 = rect.x;
    const y1 = rect.y;
    const x2 = pointerupX;
    const y2 = pointerupY;

    const t = (y1 - y2 < 0 ? y1 + (y2 - y1) : y2);
    const w = x2 - x1;
    const h = rect.height + (y1 - y2 < 0 ? (y1 - y2) : (y1 - y2));

    target.style.top = t + 'px';
    target.style.width = w + 'px';
    target.style.height = h + 'px';
  }
  setSizePoint2(target, rect, pointerdownX, pointerdownY, pointerupX, pointerupY) {
    const x1 = pointerdownX;
    const y1 = pointerdownY;
    const x2 = pointerupX;
    const y2 = pointerupY;

    const w = rect.width + (x2 - x1);
    const h = rect.height + (y2 - y1);
    target.style.width = w + 'px';
    target.style.height = h + 'px';
  }
  setSizePoint3(target, rect, pointerdownY, pointerupX, pointerupY) {
    const x1 = rect.x;
    const y1 = pointerdownY;
    const x2 = pointerupX;
    const y2 = pointerupY;
    
    const w = rect.width + (x1 - x2);
    const l = (x1-x2 < 0 ? x1+(x2-x1) : x2);
    const h = rect.height + (y2 - y1);
    
    target.style.left = l + 'px';
    target.style.width = w + 'px';
    target.style.height = h + 'px';
  }

  onpointerdown(window, point, edown) {
    const frame = createFrameMove(window);
    frame.style.zIndex = window.style.zIndex + 1;

    const rectframe = frame.getBoundingClientRect();
    top.win = window;
    top.frame = frame;
    top.edown = edown;
    top.rect = rectframe;
    const moving = (emove) => {
      clearSelection();
      top.emove = emove;
      switch (point) {
        case 0:
          this.setSizePoint0(frame, rectframe, emove.clientX, emove.clientY);
          break;
        case 1:
          this.setSizePoint1(frame, rectframe, emove.clientX, emove.clientY);
          break;
        case 2:
          this.setSizePoint2(frame, rectframe, edown.clientX, edown.clientY, emove.clientX, emove.clientY);
          break;
        case 3:
          this.setSizePoint3(frame, rectframe, edown.clientY, emove.clientX, emove.clientY);
          break;
      }
    }
    document.addEventListener('pointermove', moving);
    document.addEventListener('pointerup', (eup) => {
      document.removeEventListener('pointermove', moving);
      window.style.top = frame.style.top;
      window.style.left = frame.style.left;
      window.style.width = frame.style.width;
      window.style.height = frame.style.height;
      frame.remove();
      setPositionAllPoints(window);
    });

  }
}

// hw = document.querySelectorAll('*[data-v-app]')[3];
// const ws = new WindowSize();
// ws.attach(hw);