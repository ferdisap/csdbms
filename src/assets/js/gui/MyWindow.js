import Randomstring from "randomstring";
import {reactive} from 'vue';

export default class MyWindow {
  #collection;
  activeState = reactive([]);

  constructor(){
    this.#collection = new WeakMap();
  }

  install(app) {
    app.config.globalProperties.$window = new MyWindow();
  }

  register(vueComp){
    if(!vueComp.componentId){
      vueComp.componentId = Randomstring.generate({charset:'alphabetic'});
    }
    if(!this[vueComp.componentId]){
      this[vueComp.componentId] = {};
    }
    this.#collection.set(this[vueComp.componentId], new Proxy(vueComp,{      
      set: (t,k,v) => {
        t[k] = v;
        switch (k) {
          case 'state':
            const el = (t.$el.nodeType === 1 ? t.$el : t.$el.nextElementSibling);
            const previousDisplay = t['previousDisplay'] ? t['previousDisplay'] : '';
            if(!v && previousDisplay !== 'none'){
              t['previousDisplay'] = el.style.display;
              el.style.display = 'none';
              const index = this.activeState.findIndex(v => v === vueComp.componentId);
              this.activeState.splice(index,1);
            } else {
              el.style.display = previousDisplay;
              if(this.activeState.findIndex(v => v === vueComp.componentId) < 0){
                this.activeState.push(vueComp.componentId);
              }
            }
            break;
        }
        return true; // should always true
      },
    }));
    this.#collection.get(this[vueComp.componentId]).state = true;
  }

  setState(componentId, state){
    return this.#collection.get(this[componentId]).state = state;
  }

  getState(componentId){
    return this.#collection.get(this[componentId]).state
  }

  getComponent(componentId){
    return this.#collection.get(app.$window[componentId]);
    console.log(this.#collection.get(componentId));
    return this.#collection.get(componentId);
  }
}