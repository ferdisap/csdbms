import Dialog from '../../../vue/components/window/child/Dialog.vue';
// import TesDialog from '../../../vue/components/window/child/TesDialog.vue';
import { createApp } from 'vue';

export default class WindowDialog{
  constructor(config = {}){
    return createApp(this.componentResolver(config.name), config);
  }

  componentResolver(name){
    switch (name) {    
      // case 'tes': 
      //   return TesDialog
      default:
        return Dialog;
    }
  }
}