import { findAncestor } from "../../util/helper";

const createFrameMove = (basicElement) => {
  const frame = basicElement.cloneNode();
  frame.id = 'framemove';
  frame.style.border = "5px solid grey";
  frame.style.backgroundColor = 'transparent';
  frame.style.zIndex = (basicElement.style.zIndex - 1);
  basicElement.parentElement.appendChild(frame);
  return frame;
}

export {createFrameMove};

const clearSelection = () => {
  if (document.selection && document.selection.empty) {
    document.selection.empty();
  } else if (window.getSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
  }
}

export {clearSelection};

/**
 * HOW TO USE #1: automatic registerable
 * 1. const wmove = new WindowMove();
 * 2. wmove.attach(this.$el);
 * 
 * HOW TO USE #2: manual registerable
 * const wmove = new WindowMove();
 * const windowEl = findAncestor(event.target, ".app-window");
 * wmove.onPointerDown(event, windowEl);
 */
export default class WindowMove {
  window; // window element yang dibuat dengan createApp vue di mount

  attach(pointerDownTriggerElement, windowElement){
    pointerDownTriggerElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    if(!windowElement){
      windowElement = findAncestor(pointerDownTriggerElement,".app-window");
    }
    this.window = windowElement;
  }
  setXY(target, rect, pointerdownX, pointerdownY, pointerupX, pointerupY) {
    //const rect = target.getBoundingClientRect();
    const x1 = rect.x;
    const y1 = rect.y;
    const x2 = pointerupX - pointerdownX;
    const y2 = pointerupY - pointerdownY;
    const xfinal = (x1 + x2) < 0 ? 0 : (x1 + x2);
    const yfinal = (y1 + y2) < 0 ? 0 : (y1 + y2);
    target.style.left = xfinal + 'px';
    target.style.top = yfinal + 'px';
  }
  onPointerDown(edown, window) {
    if(!window){
      window = this.window;
    }
    // bila perlu window yang fullscreen ubah menjadi eg; 500px di line ini
    // if(window.style.height === '100%') window.style.height = '500px';
    // if(window.style.width === '100%') window.style.width ='500px';

    // create frame
    const frame = createFrameMove(window);
    frame.style.zIndex = window.style.zIndex + 1;

    const rectframe = frame.getBoundingClientRect();
    const moving = (emove) => {
      clearSelection();
      // lakukan frame move untuk simulation
      this.setXY(frame, rectframe, edown.clientX, edown.clientY, emove.clientX, emove.clientY);
    }
    document.addEventListener('pointermove', moving);
    document.addEventListener('pointerup', (eup) => {
      document.removeEventListener('pointermove', moving);
      window.style.top = frame.style.top;
      window.style.left = frame.style.left;
      window.style.width = frame.style.width;
      window.style.height = frame.style.height;
      frame.remove()
    }, { once: true })
  }
}