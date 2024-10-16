import { createApp } from 'vue/dist/vue.esm-bundler';
import Task from '../../vue/components/gui/sub/Task.vue'
import HelloWorld from '../../vue/components/window/HelloWorld.vue';
import Explorer from '../../vue/components/window/Explorer.vue';
import DML from '../../vue/components/window/DML.vue';
import XMLEditor from '../../vue/components/window/XMLEditor.vue';
import Alert from '../../vue/components/window/child/Alert.vue';
import WindowDialog from './sub/WindowDialog';
import Property from '../../vue/components/window/child/Property.vue';
import Randomstring from 'randomstring';
import WindowMove from './sub/WindowMove';
import WindowSize from './sub/WindowSize';
import { setDotsPosition, setLinesPosition } from './sub/WindowSize';
import { randomInt } from '../util/helper';
import { dialog as runDialog } from '../../vue/components/window/child/Dialog.vue';
import { alert as runAlert } from '../../vue/components/window/child/Alert.vue';
import { property as runProperty } from '../../vue/components/window/child/Property.vue';
import WindowProperty from './sub/WindowProperty';
import { history, clearUrl } from './sub/WindowHistory';
import setInterceptor from '../axiosInterceptor';
import ErrorResponseMessage from './ErrorResponseMessage';
// import { createRouter, createWebHistory } from 'vue-router';
// import RoutesVue from './../RoutesVue';

/**
 * setiap window ada tasknya, kecuali dialog, alert, dan property window
 * alert window tidak bisa di move, tidak bisa di size, tidak ada button close, top-window nya tidak bisa user interactive
 * dialog window bisa di move dan tidak bisa di size, ada button closenya, top-window nya tidak bisa user interactive
 * property window bisa di move, tidak bisa di size, ada button closenya, top-windownya masih bisa interactive
 * 
 * CUSTOM EVENTS:
 * 'new-window', 'close-window', 'toggle-window', 'sizing-window' yang di dispatch di element inside the window (sizing-window dimatikan karna nanti tidak bisa ubah icon di title bar).
 * 
 * when open a sub window (dialog, alert, properties) access the element with (".app-window").dialog.result() by the promise result
 * z-index top-window berkisar 80-200, dekstop 60-80, taskbar 50
 * 
 * TIPS:
 * (success tested in prod) dari window.vue, jika ingin mengakses custom object di appnya maka run >>> this._.appContext.app.customObject
 * (success tested in prod) dari app, jika ingin akses root element component pertama, run >>> app._container.firstElementChild
 * (fail tested in prod) dari root window.vue, this._ === app._container.__vue_app__._instance (true, kalau di production, ._instance akan null)
 * (fail tested in prod) dari app, jika ingin akses root component, maka run >>> app._container.__vue_app__._instance.data.componentId (sama dengan >>> this.componentId di dalam window.vue)
 * kesimpulan: belum bisa akses root window.vue dari app
 * 
 * untuk akses root component (window.vue) dari app, run >>> app._container.firstElementChild.__vnode.children (sampai firstElementChild saja)
 * 
 * app._container._vnode.component.props
 * helloworld._.props // get all props (in object)
 * helloworld._.subTree.children // get all component (in array)
 * helloworld._.subTree.children[0].component.subTree.children[0].el // aksess sub component dengan .children[0].component
 */
class Window {
  zIndex = []; // appId (windowId)

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

  // id
  rootAppId = "app"; // dimana mainApp.mount("#app");
  rootAppContentContainerId = "app-content-container"
  rootAppWindowContainerId = "app-content"

  // class
  windowClassGeneral = "app-window"; // setiap window akan dikasi ini
  windowClassTop = "window-top";
  windowClassTask = "window-task";
  windowClassDialog = "window-dialog";
  windowClassAlert = "window-alert";
  windowClassProperty = "window-property";
  windowClassTriggerMove = "trigger-move"
  windowClassBlocker = "window-blocker";
  

  // dipakai di task
  getTaskByElement(taskEl) {
    return this.te.get(taskEl);
  }

  constructor() {
    top.addEventListener('close-window', this.close.bind(this));
    top.addEventListener('hideshow-window', this.hideshow.bind(this));
    top.addEventListener('new-window', (e) => this.create(e.data));
  }

  /**
   * allowable key =  window:Object, task:object
   * for window = app:Object(berupa vue app), name:string, type:('top-window, dialog-window, alert-window, ?property-window'), data?:Object 
   *    for data = child?:Object 
   *       for child = sama dengan window key diatas ada name, type, data 
   * for task = title:string
   * each config must define any props with key props?:Object
   * 
   * jika membuat Dialog, Alert, Property window tanpa top window, maka document akan menjadi tempat result() nya;
   * 
   * @param {Object} config selain diatas, config ini diperuntukan juga untuk config pembuatan app vue
   * @returns {void}
   */
  create(config = {}) {
    let window, task, dialog, alert, property;
    // create window
    if (config.window) {
      window = this.newWindow(config.window);
    }
    if (config.task) {
      task = this.newTask(config.task);
      task.appId = "tsk" + Randomstring.generate({ charset: 'alphabetic' })
      task.windowId = window ? window.appId : undefined;
    }
    if (config.dialog) {
      dialog = this.newDialog(config.dialog);
      dialog.appId = "dlg" + Randomstring.generate({ charset: 'alphabetic' })
      dialog.windowId = window ? window.appId : undefined;
    }
    if (config.alert) {
      alert = this.newAlert(config.alert);
      alert.appId = "alt" + Randomstring.generate({ charset: 'alphabetic' })
      alert.windowId = window ? window.appId : undefined;
    }
    if (config.property) {
      property = this.newAlert(config.property);
      property.appId = "prp" + Randomstring.generate({ charset: 'alphabetic' })
      property.windowId = window ? window.appId : undefined;
    }
    // register
    if (window && task) {
      this.registerWindowTask(window, task);
      this.resetZIndex();
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
    return window;
  }

  // ##########################################################################################

  /**
   * @param {Object} config key = title:string
   * @returns 
   */
  newTask(config = {}) {
    return createApp(Task, config.props);
  }
  newDialog(config = {}) {
    return new WindowDialog(config);
  }
  newAlert(config = {}) {
    return createApp(Alert, config.props);
  }
  newProperty(config = {}) {
    return new WindowProperty(config);
  }
  newWindow(config = {}) {
    return createWindow.call(this,config);
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
      if(this.dm.has(window)) this.mountDialog(this.dm.get(window));
      else this.mountDialog(dialog);      
    }
    if (alert) {
      if(this.am.has(window)) this.mountDialog(this.am.get(window));
      this.mountAlert(alert);
    }
    if (property) {
      if(this.pm.has(window)) this.mountDialog(this.pm.get(window));
      this.mountProperty(property);
    }
    // mount task and window here
    if(window) this.mountWindow(window);
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
    const triggerElement = windowEl.querySelector(`.${this.windowClassTriggerMove}`);
    if (triggerElement) {
      if (windowEl.matches(`.${this.windowClassTop}`)) {
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
      else if (windowEl.matches(`.${this.windowClassDialog}`)) {
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
    if (window._container) return;

    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassTop);
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

    el.addEventListener('click', this.setToTop.bind(this, el), true); // di buat true agar ini dijalankan lebih dulu daripada close() saat ada event, misal tombol close di TitleBar.vue
    el.addEventListener('new-window', (e) => {
      e.data.config.window = { app: window };
      this.create(e.data.config);
    }, true)
    el.addEventListener('close-window', this.close.bind(this), true); // ref mountDialog(), jika sama sama tidak capture=true, close-window tidak berjalan
    el.addEventListener('toggle-window', (e) => this.toggle(e.data), true);
    // el.addEventListener('sizing-window', this.sizing.bind(this),true);
  }
  mountTask(task) {
    const container = document.getElementById('app-windowtask');
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassTask);
    el.id = task.appId;
    el.style.marginLeft = '5px';
    task.id = el.id
    container.appendChild(el);
    task.mount('#' + el.id);
    this.te.set(el, task);
    this.setBorderBottomTask(el)
    
    // event click
    el.addEventListener('click', this.toggle.bind(this,{task:el},undefined))
  }
  mountDialog(dialog) {
    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassDialog);
    el.id = dialog.appId;
    el.isMaximize = false;
    el.enableSizing = false;
    el.style.position = 'absolute';
    el.style.width = '400px';
    // el.style.height = '200px';
    el.style.top = ((top.innerHeight / 2) - 100) + 'px';
    el.style.left = ((top.innerWidth / 2) - 200) + 'px';
    el.style.backgroundColor = '#ffffff';
    dialog.id = el.id;
    this.ed.set(el, dialog);

    // configure to enable moving window
    this.enableMoving(el);

    if(dialog.windowId){
      // push z Index
      if (this.zIndex[this.zIndex.length - 1] !== dialog.windowId) {
        this.zIndex[this.zIndex.indexOf(dialog.windowId)] = undefined;
        this.zIndex.push(dialog.windowId)
      }
      this.zIndex.push(el.id);
      // prevent from user interactive in top-window
      const windowEl = document.getElementById(dialog.windowId);
      dialog.blockerId = this.addTopWindowBlocker(windowEl, el.id);

      // add dialog result
      if(windowEl.dialog) throw Error("Cannot open dialog window.");
      windowEl.dialog = runDialog();

    } else {
      if(!document.dialogResult) document.dialogResult = [];
      document.dialogResult[dialog.id] = runDialog();

      dialog.blockerId = this.addTopWindowBlocker(document.getElementById(this.rootAppWindowContainerId));
      document.getElementById(dialog.blockerId).style.zIndex = 50;
    }

    // set zIndex
    el.style.zIndex = this.zIndex.length + 80 + 1;

    // add event
    el.addEventListener('click', this.setToTop.bind(this, el), true); // di buat true agar ini dijalankan lebih dulu daripada close() saat ada event, misal tombol close di TitleBar.vue
    el.addEventListener('close-window', this.close.bind(this), true); // jika sama sama tidak capture=true, close-window tidak berjalan

    // append and mount dialog to document
    container.appendChild(el);
    dialog.mount('#' + el.id);
  }
  mountAlert(alert) {
    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassAlert);
    el.id = alert.appId;
    el.isMaximize = false;
    el.enableSizing = false;
    el.style.position = 'absolute';
    el.style.width = '400px';
    el.style.top = ((top.innerHeight / 2) - 100) + 'px';
    el.style.left = ((top.innerWidth / 2) - 200) + 'px';
    el.style.backgroundColor = '#ffffff';
    alert.id = el.id
    this.ea.set(el, alert);

    el.style.zIndex = 200; // maximum value of top-window is in range of 80-200

    if(alert.windowId){
      // prevent from user interactive in top-window
      const windowEl = document.getElementById(alert.windowId);
      alert.blockerId = this.addTopWindowBlocker(windowEl);  

      // add alert result
      if(windowEl.alert) throw Error("Cannot open alert window.");
      windowEl.alert = runAlert();
    } else {
      if(!document.alertResult) document.alertResult = [];
      document.alertResult[alert.id] = runAlert();
      alert.blockerId = this.addTopWindowBlocker(document.getElementById(this.rootAppWindowContainerId));
      document.getElementById(alert.blockerId).style.zIndex = 50;
    }

    // add event
    el.addEventListener('close-window', this.close.bind(this), true);

    // append and mount alert to document
    container.appendChild(el);
    alert.mount('#' + el.id);
  }
  mountProperty(property) {
    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassProperty);
    el.id = property.appId;
    property.id = el.id
    this.ed.set(el, property);

    if(property.windowId){
      if (this.zIndex[this.zIndex.length - 1] !== property.windowId) {
        this.zIndex[this.zIndex.indexOf(property.windowId)] = undefined;
        this.zIndex.push(property.windowId)
      }
      this.zIndex.push(el.id);

      // add property result
      const windowEl = document.getElementById(property.windowId);
      if(windowEl.property) throw Error("Cannot open property window.");
      windowEl.property = runProperty();
    } else {
      if(!document.propertyResult) document.propertyResult = [];
      document.propertyResult[property.id] = runProperty();
    }

    // append and mount property to document
    container.appendChild(el);
    property.mount('#' + el.id);
  }

  // ##########################################################################################

  addTopWindowBlocker(topWindowEl, subWindowId) {
    const blocker = document.createElement('div');
    const id = Randomstring.generate({charset:'alphabetic'});
    blocker.classList.add(this.windowClassBlocker);
    blocker.setAttribute('id', id);
    blocker.style.position = 'fixed';
    blocker.style.height = topWindowEl.style.height ? topWindowEl.style.height : '100%';
    blocker.style.width = topWindowEl.style.width ? topWindowEl.style.width : '100%';
    blocker.style.top = topWindowEl.style.top ? topWindowEl.style.top : "0px";
    blocker.style.left = topWindowEl.style.left ? topWindowEl.style.left : "0px";
    blocker.style.backgroundColor = '#9090908a';
    blocker.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if(subWindowId) document.getElementById(subWindowId).style.display = '';
    }, true);
    topWindowEl.appendChild(blocker);
    return id;
  }

  removeTopWindowBlocker(blockerId) {
    document.getElementById(blockerId).remove();
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

      clearUrl()
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
      
      //hapus property di windowEl nya yang digunakan untuk akses result alert. Kalau tidak dihapus, reuslt akan selalu <pending> jika tidak di OK atau Yes melainkan di pencet close button di title barnya
      delete windowEl.dialog;
    }
    if(document.dialogResult) delete document.dialogResult[dialog.id];
    this.zIndex[this.zIndex.indexOf(dialog.appId)] = undefined;
    this.removeTopWindowBlocker(dialog.blockerId);
    this.unmountDialog(dialog);
  }
  stopAlert(alert) {
    const windowEl = document.getElementById(alert.windowId);
    if (windowEl && this.em.has(windowEl)) {
      this.am.delete(this.em.get(windowEl));
      delete windowEl.alert;
    }
    if(document.alertResult) delete document.alertResult[alert.id];
    this.removeTopWindowBlocker(alert.blockerId);
    this.unmountAlert(alert);
  }
  stopProperty(property) {
    const windowEl = document.getElementById(property.windowId);
    if (windowEl && this.em.has(windowEl)) {
      this.am.delete(this.em.get(windowEl));
      this.stopTopWindow(this.em.get(windowEl));
      delete windowEl.property;
    }
    if(document.propertyResult) delete document.propertyResult[property.id];
    this.zIndex[this.zIndex.indexOf(property.appId)] = undefined;
    this.unmountProperty(property);
  }


  // ##########################################################################################

  /**
   * TIPS: pakai closest pada event target eg.: >>> {window: event.target.closest(".app-window")}
   * untuk show/hide window by task
   * @param {Object} el contain key task or window
   */
  toggle(el = {}, display = undefined) {
    const taskEl = el.task;
    const windowEl = el.window ?? document.getElementById(this.te.get(taskEl).windowId);
    const window = this.em.get(windowEl);
    if(!window) return; // jika ada alert/dialog/property maka tidak bisa toggle
    const isTop = (this.zIndex.indexOf(window.appId) + 1) === this.zIndex.length;
    // console.log(isTop);
    if (isTop) {
      // show/hide window (threatment undefined == null kalau pakai syntax seperti dibawah)
      const styleDisplay = display !== undefined ? display : (windowEl.style.display === 'none' ? '' : 'none');
      windowEl.style.display = styleDisplay;
    } else {
      windowEl.style.display = display !== undefined ? display : '';
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
        if (backEl) this.setToTop(backEl);
      }
    }
  }

  setToTop(windowEl) {
    this.zIndex[this.zIndex.indexOf(windowEl.id)] = undefined;
    this.zIndex.push(windowEl.id);
    windowEl.style.zIndex = (this.zIndex.length) + 80;

    // push history
    if(this.em.has(windowEl)){
      const window = this.em.get(windowEl);
      window.config.globalProperties.$history.pushState();

      // set to top all child window such as dialog, alert property
      if (this.dm.has(window)) this.setToTop(document.getElementById(this.dm.get(window).appId));
      else if (this.am.has(window)) this.setToTop(document.getElementById(this.am.get(window).appId));
      else if (this.pm.has(window)) this.setToTop(document.getElementById(this.pm.get(window).appId));
    }
  }

  resetZIndex() {
    this.zIndex = this.zIndex.filter(v => v);
    for (let i = 0; i < this.zIndex.length; i++) {
      const element = document.getElementById(this.zIndex[i]);
      if (element) element.style.zIndex = i + 80;
      else this.zIndex[i] = undefined;
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
    const windowEl = event.target.closest(`.${this.windowClassGeneral}`);;
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

      windowEl.style.left = (windowEl.pleft === '0px' ? randomInt(0, (top.innerWidth - parseInt(windowEl.style.width))) + 'px' : windowEl.pleft);
      windowEl.style.top = (windowEl.ptop === '0px' ? randomInt(0, (top.innerHeight - parseInt(windowEl.style.height))) + 'px' : windowEl.ptop);

      setDotsPosition(windowEl);
      setLinesPosition(windowEl);
      windowEl.isMaximize = false;
      return windowEl.isMaximize = false;
    }
  }

  close(event) {
    event.stopPropagation();
    const target = event.target.closest(`.${this.windowClassGeneral}`);
    switch (target.id.substr(0, 3)) {
      case "top": this.stopTopWindow(this.em.get(target)); break;
      case "tsk": this.stopTask(this.te.get(target)); break;
      case "dlg": this.stopDialog(this.ed.get(target)); break;
      case "alt": this.stopAlert(this.ea.get(target)); break;
      case "prp": this.stopProperty(this.ep.get(target)); break;
    }
  }

  /**
   * untuk hide/show all element
   * @param {Event} event perlu event.data = {state:boolean} 
   */
  showAll = true;
  hideshow(event) {
    this.zIndex.filter(v => v).reverse().forEach(appId => {
      const windowEl = document.getElementById(appId);
      // hide All
      // console.log(event.data.state, windowEl.style.display);
      // if (!event.data.state && windowEl.style.display !== 'none') {
      if (!event.data.state) {
        this.toggle({ window: windowEl },'none');
        // windowEl.style.display = 'none';
        this.showAll = false;
      }
      // show all
      // else if (event.data.state && windowEl.style.display === 'none') {
      else {
        this.toggle({ window: windowEl },'');
        // windowEl.style.display = '';
        this.showAll = true;
      }
    })
  }


}

const window = {
  install: (app) => {
    app.config.globalProperties.$window = new Window();
  }
}
export default window

/**
 * yang disebut app adalah window app
 * class ".trigger-move" diperlukan untuk memindahkan window, default sudah terpasang di TitleBar.vue
 * @param {Object} config 
 * @returns 
 */
function createWindow(config) {

  if (config.app) {
    // jika buat dialog, dll windownya sudah ada jadi ga buat lagi
    if(config.app instanceof HTMLElement) return this.em.get(config.app);
    return config.app;
  }; 

  let component;
  switch (config.name) {
    case 'HelloWorld':
      component = HelloWorld;
      break;
    case 'XMLEditor':
      component = XMLEditor;
      break;
    case 'Explorer':
      component = Explorer;
      break;
    case 'DML':
      component = DML;
      break;
  }
  // jika di create dari windowCache diambil dari config
  const app = createApp(component, config.props);
  app.appId = config.appId ?? "top" + Randomstring.generate({ charset: 'alphabetic' });
  app.name = config.name;
  if (config.uid) app.prevUid = config.uid; // prevUid adalah untuk first/root component uid, bukan app uid. Ini karena app._container.firstElementChild null
  app.use(history);
  app.use(top.pinia);
  app.config.globalProperties.$ersp = top.ersp;
  // setInterceptor(app);
  // app.use(new ErrorResponseMessage());
  return app;
}