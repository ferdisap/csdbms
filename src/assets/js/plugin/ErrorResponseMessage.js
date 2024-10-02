import { reactive } from 'vue';
export default class ErrorResponseMessage {
  install (app) {
    app.config.globalProperties.$ersp = reactive({
      bag: new Map(),
      gets: function (...args) {
        let err = [];
        for (const name of Object.values(args)) {
          err = err.concat(this.bag.get(name));
        }
        return err.filter(v => v);
      },
      get: function(name){
        return this.bag.get(name)
      },
      set: function(k,v){
        this.bag.set(k,v);
      },
      clear: function(){
        this.bag.clear();
      },
      getBag: function(){
        return this.bag;
      }
    });
  }
}