import { createApp } from 'vue';
import Task from '../../vue/components/gui/sub/Task.vue'
import HelloWorld from '../../vue/components/window/HelloWorld.vue';
import Explorer from '../../vue/components/window/Explorer.vue';
import DML from '../../vue/components/window/DML.vue';
import Randomstring from 'randomstring';
import WindowMove from './sub/WindowMove';
import { findAncestor } from '../util/helper';
import WindowSize from './sub/WindowSize';
import { setDotsPosition, setLinesPosition } from './sub/WindowSize';

class WindowTask {
  o = [];
  wm = new WeakMap(); // k = task, v = window
  tm = new WeakMap(); // k = window, v = task
  em = new WeakMap(); // k = windowEl, v = window
  te = new WeakMap(); // k = taskEl, v = task

  getWindow(task) {
    return this.wm.get(task);
  }
  getTask(window) {
    return this.tm.get(window);
  }
  getWindowByElement(el) {
    return this.em.get(el);
  }
  getTaskByElement(el) {
    return this.te.get(el);
  }

  install(app) {
    app.config.globalProperties.$task = new WindowTask();
  }

  registerWindowTask(window,task) {
    this.wm.set(task, window);
    this.tm.set(window, task);
  }

  stopTask(task) {
    const window = this.wm.get(task);
    // unmount window here
    this.unmountWindow(window);
    this.unmountTask(task);

    const taskEl = document.getElementById(task.id);
    const windowEl = document.getElementById(window.id);
    this.tm.delete(taskEl);
    this.em.delete(windowEl);
    this.wm.delete(task);
    this.tm.delete(window);    
    this.o[this.o.indexOf(task.id)] = undefined;
  }

  /**
   * allowable key = name:string, title?:string
   * @param {Object} config 
   * @returns {Object} vue app
   */
  create(config = {}) {
    const task = this.newTask(config.title ?? config.name);
    const window = this.newWindow(config);
    this.registerWindowTask(window, task);
    this.startTask(task);
    return task;
  }

  newWindow(config = {}) {
    // const window = {}; // replace this line to the vue createApp
    let window;
    switch (config.name) {
      case 'HelloWorld':
        window = createApp(HelloWorld);
        break;
      case 'Explorer':
        window = createApp(Explorer);
        break;
      case 'DML':
        window = createApp(DML);
        break;
      default:
        window.name = config.name;
        break;
    }
    return window;
  }

  newTask(title) {
    const task = createApp(Task, {
      title: title
    });
    return task;
  }

  startTask(task) {
    const window = this.wm.get(task);
    // mount task and window here
    this.mountTask(task);
    this.mountWindow(window);
  }

  mountTask(task) {
    const container = document.getElementById('app-windowtask');
    const el = document.createElement('div');
    el.classList.add('app-task');
    el.id = Randomstring.generate({ charset: 'alphabetic' });
    el.style.marginLeft = '5px'
    task.id = el.id
    container.appendChild(el);
    task.mount('#' + el.id);
    this.te.set(el, task);
    this.o.push(el.id);
    this.setBorderBottomTask(el)
  }

  unmountTask(task) {
    task.unmount();
  }

  mountWindow(window) {
    const container = document.getElementById('app-content');
    const el = document.createElement('div');
    el.classList.add('app-window');
    el.id = Randomstring.generate({ charset: 'alphabetic' });
    el.addEventListener('click', this.setToTop.bind(this, el));
    window.id = el.id;
    el.style.position = 'absolute';
    el.style.height = '100%';
    el.style.width = '100%';
    el.style.backgroundColor = '#ffffff';
    container.appendChild(el);
    window.mount('#' + el.id);
    this.em.set(el, window);
    el.style.zIndex = this.o.length;

    (new WindowSize()).attach(el);
  }

  unmountWindow(window) {
    window.unmount();
    const windowEl = document.getElementById(window.id);
    windowEl.remove();
  }

  /**
   * untuk show/hide window
   * @param {Object} el contain key task or window
   */
  toggle(el = {}) {
    let task, window;
    if (el.task) {
      task = this.getTaskByElement(el.task);
      window = this.getWindow(task);
    } else if (el.window) {
      window = this.getWindowByElement(el.window);
      task = this.getTask(window);
    }

    const isTop = (this.o.indexOf(task.id)+1) === this.o.length;
    const windowel = document.getElementById(window.id);
    if(isTop){
      // show/hide window
      const styleDisplay = windowel.style.display === 'none' ? '' : 'none';
      windowel.style.display = styleDisplay;
    } else {
      windowel.style.display = '';
      // set z-index; sama dengan @setToTop
      this.o[this.o.indexOf(task.id)] = undefined;
      this.o.push(task.id);
      windowel.style.zIndex = (this.o.length) + 80;
    }

    this.setBorderBottomTask(el.task ?? document.getElementById(task.id), windowel.style.display);
  }

  setToTop(windowEl){
    const window = this.getWindowByElement(windowEl);
    const task = this.getTask(window);
    this.o[this.o.indexOf(task.id)] = undefined;
    this.o.push(task.id);
    windowEl.style.zIndex = (this.o.length) + 80;
  }

  /**
   * support function untuk function toogle
   * @param {HTMLElement} el 
   * @param {string} display 
   */
  setBorderBottomTask(el, display){
    if(display === 'none'){
      el.style.borderBottom = '5px solid red'
    } else {
      el.style.borderBottom = '5px solid blue'
    }
  }

  move(event){
    const window = findAncestor(event.target, ".app-window");

    if(window.style.height === '100%') window.style.height = '500px';
    if(window.style.width === '100%') window.style.width ='500px';

    const wmove = new WindowMove();
    wmove.onPointerDown(event, window);

    setDotsPosition(window);    
    setLinesPosition(window);    
  }

  maximize(event){
    const window = event.target.closest(".app-window");
    window.style.left = '0px';
    window.style.top = '0px';
    window.style.height = '100%';
    window.style.width = '100%';
    setDotsPosition(window);    
    setLinesPosition(window);
  }

  minimize(event){
    const window = event.target.closest(".app-window");
    window.style.height = '500px';
    window.style.width = '500px';
    setDotsPosition(window);    
    setLinesPosition(window);
  }

  close(windowEl,event){
    if(event) event.stopPropagation();
    const window = this.getWindowByElement(windowEl);
    const task = this.getTask(window);
    this.stopTask(task);
  }


}

// TEST
// const wt = new WindowTask();
// const task = wt.createTask({
//   window_config:{
//     name: 'Explorer'
//   }
// });

export default WindowTask;