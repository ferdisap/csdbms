import { createApp } from 'vue';
import Task from '../../vue/components/gui/sub/Task.vue'
import HelloWorld from '../../vue/components/window/HelloWorld.vue';
import Explorer from '../../vue/components/window/Explorer.vue';
import DML from '../../vue/components/window/DML.vue';
import Alert from '../../vue/components/window/child/Alert.vue';
import Dialog from '../../vue/components/window/child/Dialog.vue';
import Property from '../../vue/components/window/child/Property.vue';
import Randomstring from 'randomstring';
import WindowMove from './sub/WindowMove';
import WindowSize from './sub/WindowSize';
import { setDotsPosition, setLinesPosition } from './sub/WindowSize';
import { randomInt } from '../util/helper';
import {dialog as runDialog} from '../../vue/components/window/child/Dialog.vue';



/**
 * setiap window ada tasknya, kecuali dialog, alert, dan property window
 * alert window tidak bisa di move, tidak bisa di size, tidak ada button close, top-window nya tidak bisa user interactive
 * dialog window bisa di move dan tidak bisa di size, ada button closenya, top-window nya tidak bisa user interactive
 * property window bisa di move, tidak bisa di size, ada button closenya, top-windownya masih bisa interactive
 * 
 * CUSTOM EVENTS:
 * 'new-window', 'close-window', 'toggle-window', 'sizing-window' yang di dispatch di element inside the window (sizing-window dimatikan karna nanti tidak bisa ubah icon di title bar).
 * 
 * TIPS:
 * (success tested in prod) dari window.vue, jika ingin mengakses custom object di appnya maka run >>> this._.appContext.app.customObject
 * (success tested in prod) dari app, jika ingin akses root element component pertama, run >>> app._container.firstElementChild
 * (fail tested in prod) dari root window.vue, this._ === app._container.__vue_app__._instance (true, kalau di production, ._instance akan null)
 * (fail tested in prod) dari app, jika ingin akses root component, maka run >>> app._container.__vue_app__._instance.data.componentId (sama dengan >>> this.componentId di dalam window.vue)
 * kesimpulan: belum bisa akses root window.vue dari app
 */
class Window {
  o = [];
  zIndex = [];

  em = new WeakMap(); // k = windowEl, v = window

  // wm = new WeakMap(); // k = task, v = window // nanti dihapus
  tm = new WeakMap(); // k = window, v = task
  te = new WeakMap(); // k = taskEl, v = task

  dm = new WeakMap(); // k = window, v = dialog
  ed = new WeakMap(); // k = dialogEl, v = dialog;

  am = new WeakMap(); // k = window, v = alert
  ea = new WeakMap(); // k = alertEl, v = alert;

  pm = new WeakMap(); // k = window, v = property
  ep = new WeakMap(); // k = propertyEl, v = property;

  // dipakai di task
  getTaskByElement(taskEl) {
    return this.te.get(taskEl);
  }

  constructor(){
    top.addEventListener('close-window', this.close.bind(this));
  }

  /**
   * allowable key =  window:Object, task:object
   * for window = app:Object(berupa vue app), name:string, type:('top-window, dialog-window, alert-window, ?property-window'), data?:Object 
   *    for data = child?:Object 
   *       for child = sama dengan window key diatas ada name, type, data 
   * for task = title:string
   * @param {Object} config selain diatas, config ini diperuntukan juga untuk config pembuatan app vue
   * @returns {void}
   */
  create(config = {}) {
    let window, task, dialog, alert, property;
    // create window
    if (config.window) {
      window = this.newWindow(config.window);
      window.appId = window.appId ?? "top" + Randomstring.generate({ charset: 'alphabetic' })
    }
    if (config.task) {
      task = this.newTask(config.task);
      task.appId = "tsk" + Randomstring.generate({ charset: 'alphabetic' })
      task.windowId = window.appId;
    }
    if (config.dialog) {
      dialog = this.newDialog(config.dialog);
      dialog.appId = "dlg" + Randomstring.generate({ charset: 'alphabetic' })
      dialog.windowId = window.appId;
    }
    if (config.alert) {
      alert = this.newAlert(config.alert);
      alert.appId = "alt" + Randomstring.generate({ charset: 'alphabetic' })
      alert.windowId = window.appId;
    }
    if (config.property) {
      property = this.newAlert(config.property);
      property.appId = "prp" + Randomstring.generate({ charset: 'alphabetic' })
      property.windowId = window.appId;
    }
    // register
    if (window && task) {
      this.registerWindowTask(window, task);
      this.resetZIndex;
    }
    if (window && dialog) {
      this.registerWindowDialog(window, dialog);
    }
    if (window && alert) {
      this.registerWindowAlert(window, alert);
    }
    if (window && property) {
      this.registerWindowProperty(window, property);
    }
    this.startWindow(window, task, dialog, alert, property);
  }

  // ##########################################################################################

  /**
   * @param {Object} config key = title:string
   * @returns 
   */
  newTask(config = {}) {
    return createApp(Task, config);
  }
  newDialog(config = {}) {
    return createApp(Dialog, config);
  }
  newAlert(config = {}) {
    return createApp(Alert, config);
  }
  newProperty(config = {}) {
    return createApp(Property, config);
  }
  newWindow(config = {}) {
    if (config.app) return config.app;
    let window;
    switch (config.name) {
      case 'HelloWorld':
        window = createApp(HelloWorld);
        top.whw = window;
        top.whx = createApp(HelloWorld);
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

  // ##########################################################################################

  registerWindowTask(window, task) {
    // this.wm.set(task, window);
    this.tm.set(window, task);
  }
  registerWindowDialog(window, dialog) {
    this.dm.set(window, dialog);
  }
  registerWindowAlert(window, alert) {
    this.am.set(window, alert);
  }
  registerWindowProperty(window, property) {
    this.am.set(window, property);
  }

  // ##########################################################################################

  startWindow(window, task, dialog, alert, property) {
    if (task) {
      const task = this.tm.get(window);
      this.mountTask(task);
    }
    if (dialog) {
      const dialog = this.dm.get(window);
      this.mountDialog(dialog);
    }
    if (alert) {
      const alert = this.am.get(window);
      this.mountAlert(alert);
    }
    if (property) {
      const property = this.pm.get(window);
      this.mountProperty(property);
    }
    // mount task and window here
    this.mountWindow(window);
  }

  // ##########################################################################################

  enableSizing(windowEl) {
    (new WindowSize()).attach(windowEl);
  }
  /**
   * dalam window element (template vue) harus ada class .trigger-move agar bisa di moving;
   * @param {HTMLElement} windowEl 
   */
  enableMoving(windowEl) {
    const triggerElement = windowEl.querySelector(".trigger-move");
    if (triggerElement) {
      if (windowEl.matches(".window-top")) {
        (new WindowMove()).attach(triggerElement,
          () => {
            if (windowEl.style.height === '100%') windowEl.style.height = '500px';
            if (windowEl.style.width === '100%') windowEl.style.width = '500px';
            windowEl.isMaximize = false;
            this.setToTop(windowEl);
          },
          () => {
            setDotsPosition(windowEl);
            setLinesPosition(windowEl);
          });
      } 
      else if(windowEl.matches(".window-dialog")){
        (new WindowMove()).attach(triggerElement, () => this.setToTop(windowEl));
      }
      else {
        (new WindowMove()).attach(triggerElement);
      }
    }
  }

  // ##########################################################################################

  mountWindow(window) {
    // check wheter windows has mounted or not
    if(window._container) return;

    const container = document.getElementById('app-content');
    const el = document.createElement('div');
    el.classList.add('app-window');
    el.classList.add('window-top');
    el.id = window.appId;
    el.style.position = 'absolute';
    el.isMaximize = true;
    el.style.height = '100%';
    el.style.width = '100%';
    el.style.top = '0px';
    el.ptop = '0px';
    el.pleft = '0px';
    el.style.left = '0px';
    el.enableMoving = true;
    el.enableSizing = true;
    el.style.backgroundColor = '#ffffff';
    
    container.appendChild(el);
    window.mount('#' + el.id);
    this.em.set(el, window);

    this.enableSizing(el);
    this.enableMoving(el);
    
    this.zIndex.push(el.id);
    el.style.zIndex = this.zIndex.length + 80;
    
    el.addEventListener('click', this.setToTop.bind(this, el));
    el.addEventListener('new-window', (e) => {
      e.data.config.window = {app: window};
      this.create(e.data.config);
    },true)
    el.addEventListener('close-window', this.close.bind(this),true);
    el.addEventListener('toggle-window', (e) => this.toggle(e.data),true);
    // el.addEventListener('sizing-window', this.sizing.bind(this),true);
  }
  mountTask(task) {
    const container = document.getElementById('app-windowtask');
    const el = document.createElement('div');
    el.classList.add('app-window');
    el.classList.add('window-task');
    el.id = task.appId;
    el.style.marginLeft = '5px'
    task.id = el.id
    container.appendChild(el);
    task.mount('#' + el.id);
    this.te.set(el, task);
    this.setBorderBottomTask(el)
  }
  mountDialog(dialog) {
    const container = document.getElementById('app-content');
    const el = document.createElement('div');
    el.classList.add('app-window');
    el.classList.add('window-dialog');
    el.id = dialog.appId;
    el.isMaximize = false;
    el.enableSizing = false;
    el.style.position = 'absolute';
    el.style.width = '400px';
    el.style.height = '200px';
    el.style.top = ((top.innerHeight/2) - 100) + 'px';
    el.style.left = ((top.innerWidth/2) - 200) + 'px';
    el.style.backgroundColor = '#ffffff';
    container.appendChild(el);    
    dialog.id = el.id;
    dialog.mount('#' + el.id);
    this.ed.set(el, dialog);
    
    // configure to enable moving window
    this.enableMoving(el);
    
    // set z Index
    if (this.zIndex[this.zIndex.length - 1] !== dialog.windowId) {
      this.zIndex[this.zIndex.indexOf(dialog.windowId)] = undefined;
      this.zIndex.push(dialog.windowId)
    }
    this.zIndex.push(el.id);
    el.style.zIndex = this.zIndex.length + 80;
    
    // prevent from user interactive in top-window
    const windowEl = document.getElementById(dialog.windowId);
    this.addTopWindowBlocker(windowEl);
    
    // add event
    el.addEventListener('click', this.setToTop.bind(this, el));
    el.addEventListener('close-window', this.close.bind(this),true);

    // add dialog result
    document.getElementById(dialog.windowId).dialog = runDialog();
  }
  mountAlert(alert) {
    const container = document.getElementById('app-content');
    const el = document.createElement('div');
    el.classList.add('app-window');
    el.classList.add('window-alert');
    el.id = alert.appId;
    alert.id = el.id
    container.appendChild(el);
    alert.mount('#' + el.id);
    this.ed.set(el, alert);

    if (this.zIndex[this.zIndex.length - 1] !== alert.windowId) {
      this.zIndex[this.zIndex.indexOf(alert.windowId)] = undefined;
      this.zIndex.push(alert.windowId)
    }
    this.zIndex.push(el.id);

    // prevent from user interactive in top-window
    const windowEl = document.getElementById(alert.windowId);
    windowEl.enableMoving = false;
    windowEl.enableSizing = false;
    this.addTopWindowBlocker(windowEl);
  }
  mountProperty(property) {
    const container = document.getElementById('app-content');
    const el = document.createElement('div');
    el.classList.add('app-window');
    el.classList.add('window-property');
    el.id = property.appId;
    property.id = el.id
    container.appendChild(el);
    property.mount('#' + el.id);
    this.ed.set(el, property);

    if (this.zIndex[this.zIndex.length - 1] !== property.windowId) {
      this.zIndex[this.zIndex.indexOf(property.windowId)] = undefined;
      this.zIndex.push(property.windowId)
    }
    this.zIndex.push(el.id);

    // prevent from user interactive in top-window
    const windowEl = document.getElementById(property.windowId);
    this.addTopWindowBlocker(windowEl);
  }

  // ##########################################################################################

  addTopWindowBlocker(topWindowEl) {
    const blocker = document.createElement('div');
    blocker.classList.add("window-blocker");
    blocker.style.position = 'fixed';
    blocker.style.height = topWindowEl.style.height;
    blocker.style.width = topWindowEl.style.width;
    blocker.style.top = topWindowEl.style.top;
    blocker.style.left = topWindowEl.style.left;
    blocker.style.backgroundColor = '#9090908a';
    blocker.addEventListener('pointerdown',(e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);
    topWindowEl.appendChild(blocker);
  }

  removeTopWindowBlocker(topWindowEl) {
    const blocker = topWindowEl.querySelector(".window-blocker");
    blocker.remove();
  }

  // ##########################################################################################

  unmountWindow(window) {
    window.unmount();
    const windowEl = document.getElementById(window.appId);
    if (windowEl) {
      this.em.delete(windowEl);
      windowEl.remove();
    }
  }
  unmountTask(task) {
    task.unmount();
    const taskEl = document.getElementById(task.appId);
    if (taskEl) {
      this.te.delete(taskEl);
      taskEl.remove();
    }
  }
  unmountDialog(dialog) {
    dialog.unmount();
    const dialogEl = document.getElementById(dialog.appId);
    if (dialogEl) {
      this.ed.delete(dialogEl);
    }
    dialogEl.remove();
  }
  unmountAlert(alert) {
    alert.unmount();
    const alertEl = document.getElementById(alert.appId);
    if (alertEl) {
      this.ea.delete(alertEl);
    }
    alertEl.remove();
  }
  unmountProperty(property) {
    property.unmount();
    const propertyEl = document.getElementById(property.appId);
    if (propertyEl) {
      this.ep.delete(propertyEl);
    }
    propertyEl.remove();
  }

  // ##########################################################################################

  stopWindow(window) {
    switch (window.appId.substr(0, 3)) {
      case "top": this.stopTopWindow(window); break;
      case "tsk": this.stopTask(window); break;
      case "dlg": this.stopDialog(window); break;
      case "alt": this.stopAlert(window); break;
      case "prp": this.stopProperty(window); break;
    }
  }
  stopTopWindow(window) {
    const task = this.tm.get(window);
    if (this.tm.delete(window)) {
      this.stopTask(task);
      this.zIndex[this.zIndex.indexOf(window.appId)] = undefined;

      // selanjutnya close child window (dialog, alert, property)
      if (this.dm.has(window)) this.stopDialog(this.dm.get(window));
      if (this.am.has(window)) this.stopAlert(this.am.get(window));
      if (this.pm.has(window)) this.stopProperty(this.pm.get(window));
      this.unmountWindow(window);
    }
  }
  stopTask(task) {
    const windowEl = document.getElementById(task.windowId);
    if (windowEl && this.em.has(windowEl)) {
      this.stopTopWindow(this.em.get(windowEl));
    }
    this.unmountTask(task);
  }
  // matikan child window dan top window;
  stopDialog(dialog) {
    const windowEl = document.getElementById(dialog.windowId);
    if (windowEl && this.em.has(windowEl)) {
      this.dm.delete(this.em.get(windowEl));
      // this.stopTopWindow(this.em.get(windowEl));
      this.removeTopWindowBlocker(windowEl);
    }
    this.unmountDialog(dialog);
  }
  stopAlert(alert) {
    const windowEl = document.getElementById(alert.windowId);
    if (windowEl && this.em.has(windowEl)) {
      this.am.delete(this.em.get(windowEl));
      this.stopTopWindow(this.em.get(windowEl));
    }
    this.unmountAlert(alert);
  }
  stopProperty(property) {
    const windowEl = document.getElementById(property.windowId);
    if (windowEl && this.em.has(windowEl)) {
      this.am.delete(this.em.get(windowEl));
      this.stopTopWindow(this.em.get(windowEl));
    }
    this.unmountProperty(property);
  }


  // ##########################################################################################

  /**
   * untuk show/hide window by task
   * @param {Object} el contain key task or window
   */
  toggle(el = {}) {
    const taskEl = el.task;
    const windowEl = el.window ?? document.getElementById(this.te.get(taskEl).windowId);
    const window = this.em.get(windowEl);
    const isTop = (this.zIndex.indexOf(window.appId) + 1) === this.zIndex.length;
    // console.log(isTop);
    if (isTop) {
      // show/hide window
      const styleDisplay = windowEl.style.display === 'none' ? '' : 'none';
      windowEl.style.display = styleDisplay;
    } else {
      windowEl.style.display = '';
      // set z-index; sama dengan @setToTop
      this.zIndex[this.zIndex.indexOf(window.appId)] = undefined;
      this.zIndex.push(window.appId);
      windowEl.style.zIndex = (this.zIndex.length) + 80;
    }
    this.setBorderBottomTask(taskEl ?? document.getElementById(this.tm.get(window).appId), windowEl.style.display);

    // set previous index window to top
    if (windowEl.style.display === 'none') {
      if (isTop) {
        let k = this.zIndex.length - 2;
        let id = this.zIndex[k];
        let backEl = document.getElementById(id);
        while ((k >= 0 && id && backEl.style.display === 'none') || (!(id) && k >= 0)) {
          k--;
          id = this.zIndex[k];
          backEl = document.getElementById(id);
        }
        if(backEl) this.setToTop(backEl);
      }
    }
  }

  setToTop(windowEl) {
    this.zIndex[this.zIndex.indexOf(windowEl.id)] = undefined;
    this.zIndex.push(windowEl.id);
    windowEl.style.zIndex = (this.zIndex.length) + 80;

    // set to top all child window such as dialog, alert property
    const window = this.em.get(windowEl);
    if (this.dm.has(window)) this.setToTop(document.getElementById(this.dm.get(window).appId));
    else if (this.am.has(window)) this.setToTop(document.getElementById(this.am.get(window).appId));
    else if (this.pm.has(window)) this.setToTop(document.getElementById(this.pm.get(window).appId));
  }

  resetZIndex(){
    this.zIndex = this.zIndex.filter(v => v);
    for (let i = 0; i < this.zIndex.length; i++) {
      const element = document.getElementById(this.zIndex[i]);
      element.style.zIndex = i;      
    }
  }

  /**
   * support function untuk function toogle task
   * @param {HTMLElement} taskEl 
   * @param {string} display 
   */
  setBorderBottomTask(taskEl, display) {
    if (display === 'none') {
      taskEl.style.borderBottom = '5px solid red'
    } else {
      taskEl.style.borderBottom = '5px solid blue'
    }
  }

  // ##########################################################################################

  sizing(event) {
    const windowEl = event.target.closest(".app-window");;
    if (!windowEl.isMaximize) {
      windowEl.pleft = windowEl.style.left;
      windowEl.style.left = '0px';
      windowEl.ptop = windowEl.style.top;
      windowEl.style.top = '0px';
      windowEl.style.height = '100%';
      windowEl.style.width = '100%';
      setDotsPosition(windowEl);
      setLinesPosition(windowEl);
      this.setToTop(windowEl);
      return windowEl.isMaximize = true;
    } else {
      windowEl.style.height = '500px';
      windowEl.style.width = '500px';
      
      windowEl.style.left = (windowEl.pleft === '0px' ? randomInt(0,(top.innerWidth - parseInt(windowEl.style.width))) +'px' : windowEl.pleft);
      windowEl.style.top = (windowEl.ptop === '0px' ? randomInt(0,(top.innerHeight - parseInt(windowEl.style.height))) +'px' : windowEl.ptop);

      setDotsPosition(windowEl);
      setLinesPosition(windowEl);
      windowEl.isMaximize = false;
      return windowEl.isMaximize = false;
    }
  }

  close(event) {
    event.stopPropagation();
    const target = event.target.closest(".app-window");
    switch (target.id.substr(0, 3)) {
      case "top": this.stopTopWindow(this.em.get(target)); break;
      case "tsk": this.stopTask(this.te.get(target)); break;
      case "dlg": this.stopDialog(this.ed.get(target)); break;
      case "alt": this.stopAlert(this.ea.get(target)); break;
      case "prp": this.stopProperty(this.ep.get(target)); break;
    }
  }
}

const window = {
  install: (app) => {
    app.config.globalProperties.$window = new Window();
  }
}
export default window

// TEST
// const wt = new WindowTask();
// const task = wt.createTask({
//   window_config:{
//     name: 'Explorer'
//   }
// });