import { clearSelection, createFrameMove } from "./WindowMove";

function setDotsPosition(window,dots){
  if(!dots){
    dots = window.querySelectorAll('.ws-dot');
    if(!dots.length){
      const wsize = new WindowSize();
      wsize.attach(window, 'dot');
    }
  }
  const rect = window.getBoundingClientRect();
  dots[0].style.top = '0px';
  dots[0].style.left = '0px';
  dots[1].style.top = '0px';
  dots[1].style.left = (rect.width - 10) + 'px';
  dots[2].style.top = (rect.height - 10) + 'px';
  dots[2].style.left = (rect.width - 10) + 'px';
  dots[3].style.top = (rect.height - 10) + 'px';
  dots[3].style.left = '0px';
}
export {setDotsPosition};

function setLinesPosition(window,lines){
  if(!lines){
    lines = window.querySelectorAll('.ws-line');
    if(!lines.length){
      const wsize = new WindowSize();
      wsize.attach(window, 'line');
    }
  }
  const rect = window.getBoundingClientRect();
  lines[0].style.top = '0px';
  lines[0].style.left = '11px'; // supaya ada space dengan dot width
  lines[0].style.width = window.getBoundingClientRect().width - 22 + 'px'; // supaya ada space dengan dot width
  lines[0].style.height = '10px';

  lines[1].style.left = (rect.width - 10) + 'px';
  lines[1].style.top = '11px';
  lines[1].style.width = '10px';
  lines[1].style.height = (rect.height - 22) + 'px';

  lines[2].style.top = (rect.height - 10) + 'px';
  lines[2].style.left = '11px';
  lines[2].style.width = (rect.width - 22) + 'px';
  lines[2].style.height = '10px';
  
  lines[3].style.top = '11px';
  lines[3].style.left = '0px';
  lines[3].style.width = '10px';
  lines[3].style.height = (rect.height - 22) + 'px';
}
export {setLinesPosition};

function createDots(){
  const dots = [];
  for (let i = 0; i < 4; i++) {
    dots[i] = document.createElement('div');
    dots[i].style.position = 'absolute';
    dots[i].style.height = '10px';
    dots[i].style.width = '10px';
    dots[i].style.backgroundColor = 'blue';
    dots[i].style.zIndex = '100';
    dots[i].style.backgroundColor = 'transparent';
    dots[i].classList.add('ws-dot');
    dots[i].classList.add('ws-dot-'+(i+1));
  }
  return dots;
}
export {createDots}

function createLines(){
  const lines = [];
  for (let i = 0; i < 4; i++) {
    lines[i] = document.createElement('div');
    lines[i].style.position = 'absolute';
    lines[i].style.backgroundColor = 'blue';
    lines[i].style.zIndex = '100';
    lines[i].style.backgroundColor = 'transparent';
    lines[i].classList.add('ws-line');
    lines[i].classList.add('ws-line-'+(i+1));
  }
  return lines;
}
export {createLines}

/**
 * HOW TO USE:
 * 1. const el = document.querySelector('#window'); // biasanya yang dibuat dengan class WindowTask saat mounting vue app
 * 2. const wsize = new WindowSize();
 * 3. wsize.attach(el);
 */
export default class WindowSize {

  attach(windowElement, both) {
    windowElement.enableSizing = true;
    const attachDots = () => {
      const dots = createDots();
      for (let i = 0; i < dots.length; i++) {
        dots[i].addEventListener('pointerdown', this.onpointerdown.bind(this, windowElement, {dot:i}))
        windowElement.appendChild(dots[i]);
      }
      setDotsPosition(windowElement, dots);
    }
    const attachLines = () => {
      const lines = createLines();
      for (let i = 0; i < lines.length; i++) {
        lines[i].addEventListener('pointerdown', this.onpointerdown.bind(this, windowElement, {line:i}))
        windowElement.appendChild(lines[i]);
      }
      setLinesPosition(windowElement, lines);
    }
    switch (both) {
      case 'line':
        attachLines();
        break;    
      case 'dot':
        attachDots();
        break;    
      default:
        attachLines();
        attachDots();
        break;
    }
  }

  // dot 0 ada di pojok kiri atas
  setSizeDot0(target, rect, pointerupX, pointerupY) {
    if(pointerupX < 0) pointerupX = 0;
    if(pointerupY < 0) pointerupY = 0;
    // const x1 = rect.x;
    // const y1 = rect.y;
    // const x2 = pointerupX;
    // const y2 = pointerupY;    
    // const t = (y1-y2 < 0 ? y1+(y2-y1) : y2); // untuk top
    // const l = (x1-x2 < 0 ? x1+(x2-x1) : x2); // untuk left
    // const w = rect.width + (x1-x2); // untuk width
    // const h = rect.height + (y1-y2); // untuk height
    
    target.style.top = (rect.y-pointerupY < 0 ? rect.y+(pointerupY-rect.y) : pointerupY) + 'px';
    target.style.left = (rect.x-pointerupX < 0 ? rect.x+(pointerupX-rect.x) : pointerupX) + 'px';
    target.style.width = (rect.width + (rect.x-pointerupX)) + 'px';
    target.style.height = (rect.height + (rect.y-pointerupY)) + 'px';
  }
  // line0 ada di TOP
  setSizeLine0(target, rect, pointerupY) {
    if(pointerupY < 0) pointerupY = 0;
    // console.log(top.py = pointerupY, window.innerHeight);
    // const y1 = rect.y;
    // const y2 = pointerupY;
    // const t = (y1-y2 < 0 ? y1+(y2-y1) : y2); // untuk top
    // const h = (rect.height + (y1-y2));    
    target.style.top = (rect.y-pointerupY < 0 ? rect.y+(pointerupY-rect.y) : pointerupY) + 'px';
    target.style.height = (rect.height + (rect.y-pointerupY)) + 'px';
  }
  // dot 1 ada di pojok kanan atas
  setSizeDot1(target, rect, pointerupX, pointerupY) {
    if(pointerupX > window.innerWidth) pointerupX = window.innerWidth;
    if(pointerupY < 0) pointerupY = 0;
    // const x1 = rect.x;
    // const y1 = rect.y;
    // const x2 = pointerupX;
    // const y2 = pointerupY;
    // const t = (y1 - y2 < 0 ? y1 + (y2 - y1) : y2);
    // const w = x2 - x1;
    // const h = rect.height + (y1 - y2 < 0 ? (y1 - y2) : (y1 - y2));
    target.style.top = (rect.y - pointerupY < 0 ? rect.y + (pointerupY - rect.y) : pointerupY) + 'px';
    target.style.width = (pointerupX - rect.x) + 'px';
    target.style.height = (rect.height + (rect.y - pointerupY < 0 ? (rect.y - pointerupY) : (rect.y - pointerupY))) + 'px';
  }
  // line 1 ada di Right (POV of human)
  setSizeLine1(target, rect, pointerupX) {
    if(pointerupX > window.innerWidth) pointerupX = window.innerWidth;
    // const x1 = rect.x;
    // const x2 = pointerupX;
    // const w = x2 - x1; // untuk width
    target.style.width = (pointerupX - rect.x) + 'px';
  }
  setSizeDot2(target, rect, pointerdownX, pointerdownY, pointerupX, pointerupY) {
    if(pointerupX > window.innerWidth) pointerupX = window.innerWidth;
    if(pointerupY > window.innerHeight) pointerdownY = window.innerHeight;
    // const x1 = pointerdownX;
    // const y1 = pointerdownY;
    // const x2 = pointerupX;
    // const y2 = pointerupY;
    // const w = rect.width + (x2 - x1);
    // const h = rect.height + (y2 - y1);
    target.style.width = (rect.width + (pointerupX - pointerdownX)) + 'px';
    target.style.height = (rect.height + (pointerupY - pointerdownY)) + 'px';
  }
  setSizeLine2(target, rect, pointerdownY, pointerupY) {
    if(pointerupY > window.innerHeight) pointerdownY = window.innerHeight;
    // const y1 = pointerdownY;
    // const y2 = pointerupY;
    // const h = rect.height + (y2 - y1); // untuk height
    target.style.height = rect.height + (pointerupY - pointerdownY) + 'px';
  }
  setSizeDot3(target, rect, pointerdownY, pointerupX, pointerupY) {
    if(pointerupX < 0) pointerupX = 0;
    // const x1 = rect.x;
    // const y1 = pointerdownY;
    // const x2 = pointerupX;
    // const y2 = pointerupY;
    // const w = rect.width + (x1 - x2);
    // const l = (x1-x2 < 0 ? x1+(x2-x1) : x2);
    // const h = rect.height + (y2 - y1);
    target.style.width = (rect.width + (rect.x - pointerupX)) + 'px';
    target.style.left = (rect.x-pointerupX < 0 ? rect.x+(pointerupX-rect.x) : pointerupX) + 'px';
    target.style.height = (rect.height + (pointerupY - pointerdownY)    ) + 'px';
  }
  setSizeLine3(target, rect, pointerupX) {
    if(pointerupX < 0) pointerupX = 0;
    // x1 = rect.x
    // x2 = pointerupX
    // l = (x1-x2 < 0 ? x1+(x2-x1) : x2); // untuk left 
    // w = rect.width + (x1 - x2); // untuk width    
    target.style.left = (rect.x-pointerupX < 0 ? rect.x+(pointerupX-rect.x) : pointerupX) + 'px';
    target.style.width = (rect.width + (rect.x - pointerupX)) + 'px';
  }
  onpointerdown(window, dotOrLine = {}, edown) {
    if(!window.enableSizing) return;

    const pleft = window.style.left;
    const ptop = window.style.top;

    const frame = createFrameMove(window);
    frame.style.zIndex = window.style.zIndex + 1;

    const rectframe = frame.getBoundingClientRect();
    // top.win = window;
    // top.frame = frame;
    top.edown = edown;
    // top.rect = rectframe;
    const moving = (emove) => {
      clearSelection();
      // top.emove = emove;
      switch (dotOrLine.dot) {
        case 0:
          this.setSizeDot0(frame, rectframe, emove.clientX, emove.clientY);
          break;
        case 1:
          this.setSizeDot1(frame, rectframe, emove.clientX, emove.clientY);
          break;
        case 2:
          this.setSizeDot2(frame, rectframe, edown.clientX, edown.clientY, emove.clientX, emove.clientY);
          break;
        case 3:
          this.setSizeDot3(frame, rectframe, edown.clientY, emove.clientX, emove.clientY);
          break;
      }
      switch (dotOrLine.line) {
        case 0:
          this.setSizeLine0(frame, rectframe, emove.clientY);
          break;
        case 1:
          this.setSizeLine1(frame, rectframe, emove.clientX);
          break;
        case 2:
          this.setSizeLine2(frame, rectframe, edown.clientY, emove.clientY);
          break;
        case 3:
          this.setSizeLine3(frame, rectframe, emove.clientX);
          break;
      }
    }
    document.addEventListener('pointermove', moving);
    document.addEventListener('pointerup', () => {
      document.removeEventListener('pointermove', moving);
      window.style.top = frame.style.top;
      window.style.left = frame.style.left;
      window.style.width = frame.style.width;
      window.style.height = frame.style.height;

      window.pleft = pleft;
      window.ptop = ptop

      frame.remove();
      setDotsPosition(window);
      setLinesPosition(window);
      resizedEvent(window);
    },{once:true});
  }
}

function resizedEvent(target){
  const windowResizedEvent = new Event('window-resized');
  target.dispatchEvent(windowResizedEvent);      
}

export {resizedEvent};

// hw = document.querySelectorAll('*[data-v-app]')[3];
// const ws = new WindowSize();
// ws.attach(hw);