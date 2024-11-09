import { createApp } from 'vue/dist/vue.esm-bundler';
import Task from '../../vue/components/gui/sub/Task.vue'
import HelloWorld from '../../vue/components/window/HelloWorld.vue';
import Explorer from '../../vue/components/window/Explorer.vue';
import DML from '../../vue/components/window/DML.vue';
import DDN from '../../vue/components/window/DDN.vue';
import ICN from '../../vue/components/window/ICN.vue';
import IMF from '../../vue/components/window/IMF.vue';
import ImageMapper from '../../vue/components/window/ImageMapper.vue';
import XMLEditor from '../../vue/components/window/XMLEditor.vue';
import PDFViewer from '../../vue/components/window/PDFViewer.vue';
import Trash from '../../vue/components/window/Trash.vue';
import Alert from '../../vue/components/window/child/Alert.vue';
import WindowDialog from './sub/WindowDialog';
import Property from '../../vue/components/window/child/Property.vue';
import Randomstring from 'randomstring';
import WindowMove from './sub/WindowMove';
import WindowSize, { resizedEvent } from './sub/WindowSize';
import { setDotsPosition, setLinesPosition } from './sub/WindowSize';
import { randomInt } from '../util/helper';
import { dialog as runDialog } from '../../vue/components/window/child/Dialog.vue';
import { alert as runAlert } from '../../vue/components/window/child/Alert.vue';
import { property as runProperty } from '../../vue/components/window/child/Property.vue';
import WindowProperty from './sub/WindowProperty';
import { history, clearUrl } from './sub/WindowHistory';
import setInterceptor from '../axiosInterceptor';
import ErrorResponseMessage from './ErrorResponseMessage';
import { addGetLogic } from '../util/ObjectProperty';
// import { createRouter, createWebHistory } from 'vue-router';
// import RoutesVue from './../RoutesVue';
import {style as styleProperty} from '../../vue/components/window/child/Property.vue'
import {style as styleDialog} from '../../vue/components/window/child/Dialog.vue'
import {style as styleAlert} from '../../vue/components/window/child/Alert.vue'

// create window
const _window = function (data) {
  const window = createWindow(data);
  // this.mountWindow(window, data.style);
  window.type = 'window';
  window.loadFromCache = data.loadFromCache;
  return window;
}
const _task = function (data, parentId) {
  const task = createApp(Task, data.props);
  task.appId = data.id ?? "tsk" + Randomstring.generate({ charset: 'alphabetic' })
  task.windowId = parentId ? parentId : undefined;
  // this.mountTask(task);
  task.type = 'task';
  return task;
}
const _dialog = function (data, parentId) {
  const dialog = new WindowDialog(data, parentId);
  dialog.appId = data.id ?? "dlg" + Randomstring.generate({ charset: 'alphabetic' })
  dialog.windowId = parentId ? parentId : undefined;
  // this.mountDialog(dialog, data.style);
  dialog.type = 'dialog';
  return dialog
}
const _alert = function (data, parentId) {
  const alert = createApp(Alert, data.props);
  alert.appId = data.id ?? "alt" + Randomstring.generate({ charset: 'alphabetic' })
  alert.windowId = parentId ? parentId : undefined;
  // this.mountAlert(alert, data.style);
  alert.type = 'alert';
  return alert;
}
const _property = function (data, parentId) {
  if (data.app && data.app instanceof HTMLElement) return data.app.__vue_app__;
  const property = new WindowProperty(data, parentId);
  property.appId = data.id ?? "prp" + Randomstring.generate({ charset: 'alphabetic' })
  property.windowId = parentId ? parentId : undefined;
  // this.mountProperty(property, data.style);
  property.type = 'property';
  return property;
};


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

  // em = new WeakMap(); // k = windowEl, v = window // deprecated

  // // wm = new WeakMap(); // k = task, v = window // nanti dihapus
  // tm = new WeakMap(); // k = window, v = task // deprecated
  // te = new WeakMap(); // k = taskEl, v = task // deprecated

  // dm = new WeakMap(); // k = window, v = dialog // deprecated
  // ed = new WeakMap(); // k = dialogEl, v = dialog; // deprecated

  // am = new WeakMap(); // k = window, v = alert // deprecated
  // ea = new WeakMap(); // k = alertEl, v = alert; // // deprecated

  // pm = new WeakMap(); // k = window, v = property
  // ep = new WeakMap(); // k = propertyEl, v = property;

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
    return taskEl.__vue_app__;
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
    let parent, window;

    if(config.parent){
      switch (config.parent.type) {
        case 'window':
          parent = _window(config.parent);
          break;
        case 'alert':
          parent = _alert(config.parent);
        case 'dialog':
          parent = _dialog(config.parent);
        case 'property':
          parent = _property(config.parent);
        default:
          break;
      }
    }

    let windowType, windowStyle;
    if (config.window) {
      window = _window(config.window);
      windowType = 'window';
      windowStyle = config.window.style;
    }
    if (config.task) {
      window = _task(config.task, parent ? parent.appId : null);
      windowType = 'task';
      windowStyle = config.task.style;
    }
    if (config.dialog) {
      window = _dialog(config.dialog, parent ? parent.appId : null);
      windowType = 'dialog';
      windowStyle = config.dialog.style;
    }
    if (config.alert) {
      window = _alert(config.alert, parent ? parent.appId : null);
      windowType = 'alert';
      windowStyle = config.alert.style;
    }
    if (config.property) {
      window = _property(config.property, parent ? parent.appId : null);
      windowType = 'property';
      windowStyle = config.property.style;
    }

    // register
    if(parent){
      switch (windowType) {
        case 'task':
          parent.task = new WeakRef(window);
          window.parent = new WeakRef(parent);
          try {
            addGetLogic(parent, 'task', (ctx, v) => v.deref());
          } catch (error) { }
          try {
            addGetLogic(window, 'parent', (ctx, v) => v.deref());
          } catch (error) { }
          this.resetZIndex();
          break;
        default:
          parent.child = new WeakRef(window);
          window.parent = new WeakRef(parent);
          try {
            addGetLogic(parent, 'child', (ctx, v) => v.deref());
          } catch (error) { }
          try {
            addGetLogic(window, 'parent', (ctx, v) => v.deref());
          } catch (error) { }
      }
    }


    // mount parent
    if (parent && !parent.mounted) {
      switch (config.parent.type) {
        case 'window': this.mountWindow(parent, config.parent.style); break;
        case 'alert': this.mountAlert(parent, config.parent.style); break;
        case 'dialog': this.mountDialog(parent, config.parent.style); break;
        case 'property': this.mountProperty(parent, config.parent.style); break;
      }
    }

    // mount window
    if (!window.mounted) {
      switch (windowType) {
        case 'task': this.mountTask(window, windowStyle); break;
        case 'window': this.mountWindow(window, windowStyle); break;
        case 'alert': this.mountAlert(window, windowStyle); break;
        case 'dialog': this.mountDialog(window, windowStyle); break;
        case 'property': this.mountProperty(window, windowStyle); break;
      }
    }

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
            resizedEvent(windowEl);
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

  mountWindow(window, style) {
    // check wheter windows has mounted or not
    if (window._container) return;

    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassTop);
    el.id = window.appId;
    el.ptop = '0px';
    el.pleft = '0px';
    el.enableMoving = true;
    el.enableSizing = true;

    if (style) {
      el.style.position = style.position;
      el.style.height = style.height;
      el.style.width = style.width;
      el.style.top = style.top;
      el.style.left = style.left;
      el.style.backgroundColor = style.backgroundColor;
    } else {
      el.style.position = 'absolute';
      el.style.height = '100%';
      el.style.width = '100%';
      el.style.top = '0px';
      el.style.left = '0px';
      el.style.backgroundColor = '#ffffff';
    }

    el.isMaximize = (el.style.width === '100%' && el.style.height === '100%') ? true : false;

    container.appendChild(el);
    window.mount('#' + el.id);


    this.enableSizing(el);
    this.enableMoving(el);

    this.zIndex.push(el.id);
    el.style.zIndex = this.zIndex.length + 80;

    el.addEventListener('click', this.setToTop.bind(this, el), true); // di buat true agar ini dijalankan lebih dulu daripada close() saat ada event, misal tombol close di TitleBar.vue
    // kalau mau open window dialog, pakai top.dispatchEvent saja
    // el.addEventListener('new-window', (e) => {
    //   e.stopPropagation();
    //   e.data.config.window = { app: window };
    //   this.create(e.data.config);
    // }, true)
    el.addEventListener('close-window', this.close.bind(this), true); // ref mountDialog(), jika sama sama tidak capture=true, close-window tidak berjalan
    el.addEventListener('toggle-window', (e) => this.toggle(e.data), true);
    // el.addEventListener('sizing-window', this.sizing.bind(this),true);

    window.mounted = true;
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
    this.setBorderBottomTask(el)

    // event click
    el.addEventListener('click', this.toggle.bind(this, { taskEl: el }, undefined))

    task.mounted = true;
  }
  mountDialog(dialog, style) {
    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassDialog);
    el.id = dialog.appId;
    el.isMaximize = false;
    el.enableSizing = false;

    if (!style) style = styleDialog();
    Object.keys(style).forEach(key => {
      el.style[key] = style[key]
    })

    dialog.id = el.id;

    if (dialog.windowId) {
      // push z Index
      // if (this.zIndex[this.zIndex.length - 1] !== dialog.windowId) {
      //   this.zIndex[this.zIndex.indexOf(dialog.windowId)] = undefined;
      //   this.zIndex.push(dialog.windowId)
      // }
      // this.zIndex.push(el.id);
      // prevent from user interactive in top-window
      const windowEl = document.getElementById(dialog.windowId);
      dialog.blockerId = this.addWindowBlocker(windowEl);

      // add dialog result
      if (windowEl.dialog) throw Error("Cannot open dialog window.");
      windowEl.dialog = runDialog();

    } else {
      if (!document.dialogResult) document.dialogResult = [];
      document.dialogResult[dialog.id] = runDialog();

      dialog.blockerId = this.addWindowBlocker(document.getElementById(this.rootAppWindowContainerId));
      document.getElementById(dialog.blockerId).style.zIndex = 50;
    }

    // set zIndex
    // el.style.zIndex = this.zIndex.length + 80 + 1;
    el.style.zIndex = dialog.parent._container.style.zIndex;

    // add event
    el.addEventListener('click', this.setToTop.bind(this, el), true); // di buat true agar ini dijalankan lebih dulu daripada close() saat ada event, misal tombol close di TitleBar.vue
    el.addEventListener('close-window', this.close.bind(this), true); // jika sama sama tidak capture=true, close-window tidak berjalan

    // append and mount dialog to document
    container.appendChild(el);
    dialog.mount('#' + el.id);

    dialog.mounted = true;
  }
  mountAlert(alert, style) {
    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassAlert);
    el.id = alert.appId;
    el.isMaximize = false;
    el.enableSizing = false;

    if (!style) style = styleAlert();
    Object.keys(style).forEach(key => {
      el.style[key] = style[key]
    })

    alert.id = el.id

    el.style.zIndex = 200; // maximum value of top-window is in range of 80-200

    if (alert.windowId) {
      // prevent from user interactive in top-window
      // const windowEl = document.getElementById(alert.windowId);
      alert.blockerId = this.addWindowBlocker(alert.parent._container);

      // add alert result
      if (alert.parent._container.alert) throw Error("Cannot open alert window.");
      alert.parent._container.alert = runAlert();
    } else {
      if (!document.alertResult) document.alertResult = [];
      document.alertResult[alert.id] = runAlert();
      alert.blockerId = this.addWindowBlocker(document.getElementById(this.rootAppWindowContainerId));
      document.getElementById(alert.blockerId).style.zIndex = 50;
    }

    // add event
    el.addEventListener('close-window', this.close.bind(this), true);

    // append and mount alert to document
    container.appendChild(el);
    alert.mount('#' + el.id);

    alert.mounted = true;
  }
  mountProperty(property, style) {
    const container = document.getElementById(this.rootAppWindowContainerId);
    const el = document.createElement('div');
    el.classList.add(this.windowClassGeneral);
    el.classList.add(this.windowClassProperty);
    el.id = property.appId;
    el.isMaximize = false;
    el.enableSizing = false;
    el.enableMoving = true;

    if (!style) style = styleProperty();
    Object.keys(style).forEach(key => {
      el.style[key] = style[key]
    })

    property.id = el.id

    // console.log(top.pp = property);
    if (property.windowId) {
      // if (this.zIndex[this.zIndex.length - 1] !== property.windowId) {
      //   this.zIndex[this.zIndex.indexOf(property.windowId)] = undefined;
      //   this.zIndex.push(property.windowId)
      // }
      // this.zIndex.push(el.id);
      // prevent from user interactive in top-window
      // const windowEl = document.getElementById(property.windowId);
      // property.blockerId = this.addWindowBlocker(windowEl, el.id);
      property.blockerId = this.addWindowBlocker(property.parent._container);

      // add property result
      // console.log(top.wel = windowEl, windowEl.property);
      if (property.parent._container.property) throw Error("Cannot open property window.");
      property.parent._container.property = runProperty();
    } else {
      if (!document.propertyResult) document.propertyResult = [];
      document.propertyResult[property.id] = runProperty();
    }

    // set zIndex
    // el.style.zIndex = this.zIndex.length + 80 + 1;
    el.style.zIndex = property.parent._container.style.zIndex;

    // add event
    el.addEventListener('click', this.setToTop.bind(this, el), true); // di buat true agar ini dijalankan lebih dulu daripada close() saat ada event, misal tombol close di TitleBar.vue
    el.addEventListener('close-window', this.close.bind(this), true); // jika sama sama tidak capture=true, close-window tidak berjalan

    // append and mount property to document
    container.appendChild(el);
    property.mount('#' + el.id);

    // configure to enable moving window
    this.enableMoving(el);

    property.mounted = true;
  }

  // ##########################################################################################

  addWindowBlocker(topWindowEl) {
    const blocker = document.createElement('div');
    const id = Randomstring.generate({ charset: 'alphabetic' });
    const rect = topWindowEl.getBoundingClientRect();
    let h,w;
    if(topWindowEl.isMaximize){
      h = topWindowEl.style.height;
      w = topWindowEl.style.width;
    } else {
      h = rect.height + 'px'
      w = rect.width + 'px';
    }
    blocker.classList.add(this.windowClassBlocker);
    blocker.setAttribute('id', id);
    blocker.style.position = 'fixed';
    blocker.style.height = h;
    blocker.style.width = w;
    blocker.style.top = rect.top + 'px';
    blocker.style.left = rect.left + 'px';
    blocker.style.backgroundColor = '#9090908a';
    // blocker.addEventListener('pointerdown', (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    // }, true);
    topWindowEl.appendChild(blocker);
    topWindowEl.pez = topWindowEl.enableSizing;
    topWindowEl.enableSizing = false;
    topWindowEl.pem = topWindowEl.enableMoving;
    topWindowEl.enableMoving = false;
    topWindowEl.blocker = blocker;
    return id;
  }

  removeWindowBlocker(topWindowEl) {
    topWindowEl.querySelector("."+this.windowClassBlocker).remove();
    topWindowEl.enableSizing = topWindowEl.pez;
    topWindowEl.enableMoving = topWindowEl.pem;
    delete topWindowEl.blocker;
  }

  // ##########################################################################################

  unmountWindow(window) {
    window.unmount();
    document.getElementById(window.appId).remove();
  }
  unmountTask(task) {
    task.unmount();
    document.getElementById(task.appId).remove();
  }
  unmountDialog(dialog) {
    dialog.unmount();
    document.getElementById(dialog.appId).remove();
    try{delete dialog.parent.child;}
    catch(e){}
  }
  unmountAlert(alert) {
    alert.unmount();
    document.getElementById(alert.appId).remove();
    try{delete alert.parent.child;}
    catch(e){}
  }
  unmountProperty(property) {
    property.unmount();
    document.getElementById(property.appId).remove();
    try{delete property.parent.child;}
    catch(e){}
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
    const task = window.task;
    delete window.task;
    delete task.parent;
    this.unmountTask(task);
    this.zIndex[this.zIndex.indexOf(window.appId)] = undefined;

    // selanjutnya close child window (dialog, alert, property)
    if (window.child) {
      switch (window.child.type) {
        case 'dialog': this.stopDialog(window.child); break;
        case 'alert': this.stopAlert(window.child); break;
        case 'property': this.stopProperty(window.child); break;
      }
    }
    this.unmountWindow(window);
    clearUrl()
  }
  stopTask(task) {
    if (task.parent) this.stopTopWindow(task.parent);
  }
  // matikan child window dan top window;
  stopDialog(dialog) {
    try{
      delete document.getElementById(dialog.windowId).dialog;
      this.removeWindowBlocker(dialog.parent._container);
    }
    catch(e){}
    if (document.dialogResult) delete document.dialogResult[dialog.id];
    this.zIndex[this.zIndex.indexOf(dialog.appId)] = undefined;
    this.unmountDialog(dialog);
  }
  stopAlert(alert) {
    try{
      delete document.getElementById(alert.windowId).alert;
      this.removeWindowBlocker(alert.parent._container);
    }
    catch(e){}
    if (document.alertResult) delete document.alertResult[alert.id];
    this.zIndex[this.zIndex.indexOf(alert.appId)] = undefined;
    this.unmountAlert(alert);
  }
  stopProperty(property) {
    try{
      delete document.getElementById(property.windowId).property;
      this.removeWindowBlocker(property.parent._container);
    }
    catch(e){}
    if (document.propertyResult) delete document.propertyResult[property.id];
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
    let taskEl, window, windowEl;
    if (el.taskEl) {
      taskEl = el.taskEl;
      window = taskEl.__vue_app__.parent;
      windowEl = window._container;
    } else {
      windowEl = el.windowEl;
      window = windowEl.__vue_app__;
      taskEl = window.task ? window.task._container : undefined; // jika dialog/alert/property tidak ada task nya
    }
    if (windowEl.style.display === display) return;
    if (!window) return; // jika ada alert/dialog/property maka tidak bisa toggle
    const isTop = (this.zIndex.indexOf(window.appId) + 1) === this.zIndex.length;
    if(!isTop && display === undefined && windowEl.style.display !== 'none') display = ''; // jika kondisi current window not in top, variable display tidak di set, dan current display tidak none (sederhananya window zIndex nomor >2 dibelakang) maka window dan anaknya akan menjadi top
    windowEl.style.display = (display !== undefined ? display : (windowEl.style.display === 'none' ? '' : 'none'));
    if (windowEl.style.display !== 'none' && window.type === 'window') {
      this.zIndex[this.zIndex.indexOf(window.appId)] = undefined;
      this.zIndex.push(window.appId);
      windowEl.style.zIndex = (this.zIndex.length) + 80;
    }
    this.toggleChild(windowEl)

    if (taskEl) this.setBorderBottomTask(taskEl ?? document.getElementById(window.task.appId), windowEl.style.display);

  }

  toggleChild(windowEl) {
    const child = windowEl.__vue_app__.child;
    if (child && child.type !== 'window') {
      child._container.style.display = windowEl.style.display;
      child._container.style.zIndex = windowEl.__vue_app__._container.style.zIndex;
      this.toggleChild(child._container);
    }
  }

  ancestorOrSelf(window){
    while(window.parent){
      return this.ancestorOrSelf(window.parent);
    }
    return window;
  }

  setToTop(windowEl) {
    if (this.zIndex.indexOf(windowEl.id) === (this.zIndex.length - 1)) return;

    if (windowEl.__vue_app__.type === 'window') {
      this.zIndex[this.zIndex.indexOf(windowEl.id)] = undefined;
      this.zIndex.push(windowEl.id);
      windowEl.style.zIndex = (this.zIndex.length) + 80;

      // push history
      const window = windowEl.__vue_app__;
      if (window.config.globalProperties.$history) window.config.globalProperties.$history.pushState();

      this.toggleChild(windowEl)
    }
    else if (windowEl.__vue_app__.type === 'dialog' || windowEl.__vue_app__.type === 'property') {
      windowEl.style.zIndex = windowEl.__vue_app__.parent._container.style.zIndex;
      if(windowEl.__vue_app__.parent && !((this.zIndex.filter(v => v).indexOf(this.ancestorOrSelf(windowEl.__vue_app__).appId) + 1) === this.zIndex.length)) {
        // if !isTop (jika ancestor ada dan tidak di Top maka akan di TOP kan ancestor/window dan childnya)
        const ancestor = this.ancestorOrSelf(windowEl.__vue_app__);
        this.zIndex[this.zIndex.indexOf(ancestor.appId)] = undefined;
        this.zIndex.push(ancestor.appId);
        ancestor._container.style.zIndex = (this.zIndex.length) + 80;        
        this.toggleChild(ancestor._container); 
      }
    }

    // set to top all child window such as dialog, alert property
    if (window.child) {
      this.setToTop(window.child._container);
    }
  }

  resetZIndex() {
    this.zIndex = this.zIndex.filter(v => v);
    for (let i = 0; i < this.zIndex.length; i++) {
      const windowEl = document.getElementById(this.zIndex[i]);
      if (windowEl) {
        windowEl.style.zIndex = i + 80;
        if (windowEl.__vue_app__ && windowEl.__vue_app__.child) {
          this.setToTop(windowEl.__vue_app__.child._container);
        }
      }
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
      resizedEvent(windowEl);
      return windowEl.isMaximize = true;
    } else {
      windowEl.style.height = '500px';
      windowEl.style.width = '500px';

      windowEl.style.left = (windowEl.pleft === '0px' ? randomInt(0, (top.innerWidth - parseInt(windowEl.style.width))) + 'px' : windowEl.pleft);
      windowEl.style.top = (windowEl.ptop === '0px' ? randomInt(0, (top.innerHeight - parseInt(windowEl.style.height))) + 'px' : windowEl.ptop);

      setDotsPosition(windowEl);
      setLinesPosition(windowEl);
      windowEl.isMaximize = false;
      resizedEvent(windowEl);
      return windowEl.isMaximize = false;
    }
  }

  close(event) {
    event.stopPropagation();
    const target = event.target.closest(`.${this.windowClassGeneral}`);
    switch (target.id.substr(0, 3)) {
      case "top": this.stopTopWindow(target.__vue_app__); break;
      case "tsk": this.stopTask(target.__vue_app__); break;
      case "dlg": this.stopDialog(target.__vue_app__); break;
      case "alt": this.stopAlert(target.__vue_app__); break;
      case "prp": this.stopProperty(target.__vue_app__); break;
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
      const taskEl = windowEl.__vue_app__.task ? windowEl.__vue_app__.task._container : undefined; // jika dialog/alert/property tidak ada task nya
      // hide All
      // if (!event.data.state && windowEl.style.display !== 'none') {
      if (!event.data.state) {
        // this.toggle({ windowEl: windowEl }, 'none');
        windowEl.style.display = 'none';
        if (taskEl) this.setBorderBottomTask(taskEl, 'none');
        this.showAll = false;
      }
      // show all
      // else if (event.data.state && windowEl.style.display === 'none') {
      else {
        // this.toggle({ windowEl: windowEl }, '');
        windowEl.style.display = '';
        if (taskEl) this.setBorderBottomTask(taskEl, '');
        this.showAll = true;
      }
      this.toggleChild(windowEl);
    })
  }


}

const window = {
  install: (app) => {
    app.config.globalProperties.$window = new Window();
    top.$window = app.config.globalProperties.$window;
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
    if (config.app instanceof HTMLElement) return config.app.__vue_app__;
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
    case 'DDN':
      component = DDN;
      break;
    case 'ICN':
      component = ICN;
      break;
    case 'IMF':
      component = IMF;
      break;
    case 'ImageMapper':
      component = ImageMapper;
      break;
    case 'PDFViewer':
      component = PDFViewer;
      break;
    case 'Trash':
      component = Trash;
      break;
    default:
      throw new Error('cannot create window');
      break;
  }
  // jika di create dari windowCache diambil dari config
  const app = createApp(component, config.props);
  app.appId = config.id ?? config.appId ?? "top" + Randomstring.generate({ charset: 'alphabetic' }); // config.appId is deprecated
  app.name = config.name;
  if (config.uid) app.prevUid = config.uid; // prevUid adalah untuk first/root component uid, bukan app uid. Ini karena app._container.firstElementChild null
  app.use(history);
  app.use(top.pinia);
  app.config.globalProperties.$ersp = top.ersp;
  // setInterceptor(app);
  // app.use(new ErrorResponseMessage());
  return app;
}