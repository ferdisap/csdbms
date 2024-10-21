const createFrameMove = (basicElement) => {
  const frame = basicElement.cloneNode();
  frame.id = 'framemove';
  frame.style.border = "5px solid grey";
  frame.style.backgroundColor = 'transparent';
  frame.style.zIndex = (basicElement.style.zIndex - 1);
  basicElement.parentElement.appendChild(frame);
  frame.enableSizing = basicElement.enableSizing;
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
  // window; // window element yang dibuat dengan createApp vue di mount
  persistenSize = false;

  attach(pointerDownTriggerElement, beforeMove, afterMove, windowElement){
    if(!windowElement){
      windowElement = pointerDownTriggerElement.closest(".app-window");
    }
    windowElement.enableMoving = true;
    pointerDownTriggerElement.addEventListener('pointerdown', this.onPointerDown.bind(this, windowElement, beforeMove, afterMove));
  }
  setXY(target, rect, pointerdownX, pointerdownY, pointerupX, pointerupY) {
    // const x1 = rect.x;
    // const y1 = rect.y;
    // const x2 = pointerupX - pointerdownX;
    // const y2 = pointerupY - pointerdownY;
    // const xfinal = (x1 + x2) < 0 ? 0 : (x1 + x2);
    // const yfinal = (y1 + y2) < 0 ? 0 : (y1 + y2);
    // target.style.left = xfinal + 'px';
    // target.style.top = yfinal + 'px';
    // return;
    const l = (rect.x + (pointerupX - pointerdownX)) < -5 ? -5 : (rect.x + (pointerupX - pointerdownX));
    const w = this.appRect.width;

    const pleft = target.style.left;
    const ptop = target.style.top;
    // suaya jika framenya di geser maximal ke kiri, layar akan dibagi 2 dan ditaruh di kiri
    if(target.enableSizing && l <= -5 && !this.persistenSize) {
      const h = target.closest('#app-content-container').getBoundingClientRect().height;
      target.style.left = '0px';
      target.style.top = '0px';
      target.style.width = w/2 + 'px';
      target.style.height = h + 'px';
    } 
    // suaya jika framenya di geser maximal ke kiri, layar akan dibagi 2 dan ditaruh di kanan
    else if(target.enableSizing && (l + rect.width) >= (w + 5) && !this.persistenSize){
      const h = target.closest('#app-content-container').getBoundingClientRect().height;
      target.style.left = w/2 + 'px';
      target.style.top = '0px';
      target.style.width = w/2 + 'px';
      target.style.height = h + 'px';
    }
    // supaya windownya full jika mouse diarahkan ke atas
    else if(target.enableSizing && pointerupY < -5){
      target.style.left = '0px';
      target.style.top = '0px';
      target.style.width = '100%';
      target.style.height = '100%';
    }
    // supaya windownya full jika mouse diarahkan ke bawah (dikurang 2 karena tinggi titlebar 48, jadi asumsikan kliknya ditengah2 title bar jadi 24)
    else if(target.enableSizing && ( pointerupY + rect.height - 24)  > (this.appRect.height + 5)){
      target.style.left = pleft;
      target.style.top = ptop;
      target.style.height = this.pheight;
      target.style.width = this.pwidth;
    }
    else {
      target.style.height = this.pheight;
      target.style.width = this.pwidth;
      target.style.left = l + 'px';
      target.style.top = (rect.y + (pointerupY - pointerdownY)) < 0 ? 0 : (rect.y + (pointerupY - pointerdownY)) + 'px';
    }
  }
  onPointerDown(windowEl, beforeMove, afterMove, edown) {
    if(edown.which !== 1) return;
    if(!windowEl.enableMoving) return;

    
    this.appRect = document.getElementById('app-content-container').getBoundingClientRect();

    let frame,rectframe,isMoved;
    const firstMoving = (emove) => {
      emove.stopPropagation();
      isMoved = true;
      frame = createFrameMove(windowEl);
      frame.style.zIndex = windowEl.style.zIndex + 1;

      if(beforeMove) beforeMove();
      const windowElRect = windowEl.getBoundingClientRect();
      this.pleft = windowElRect.left + 'px';
      this.ptop = windowElRect.top + 'px';
      this.pheight = windowElRect.height + 'px';
      this.pwidth = windowElRect.width + 'px';

      windowEl.style.opacity = '50%';
      this.setXY(frame, frame.getBoundingClientRect(), edown.clientX, edown.clientY, emove.clientX, emove.clientY);
      rectframe = frame.getBoundingClientRect();
    }
    const moving = (emove) => {
      clearSelection();
      // lakukan frame move untuk simulation
      this.setXY(frame, rectframe, edown.clientX, edown.clientY, emove.clientX, emove.clientY);
    }
    document.addEventListener('pointermove', firstMoving, {once:true,capture:true});
    document.addEventListener('pointermove', moving);
    document.addEventListener('pointerup' , ()=>{
      document.removeEventListener('pointermove', moving);
      document.removeEventListener('pointermove', firstMoving,{once:true,capture:true});

      if(!isMoved) return;
      windowEl.style.top = frame.style.top;
      windowEl.style.left = frame.style.left;
      if(!this.persistenSize){
        windowEl.style.width = frame.style.width;
        windowEl.style.height = frame.style.height;
      }
      
      windowEl.pleft = this.pleft;
      windowEl.ptop = this.ptop

      frame.remove()
      windowEl.style.opacity = '';
      if(afterMove) afterMove();

    },{once:true,capture:true})
  }
}