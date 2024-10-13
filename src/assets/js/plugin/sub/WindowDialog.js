import Dialog from '../../../vue/components/window/child/Dialog.vue';
import { createApp } from 'vue';

export default class WindowDialog{
  constructor(config = {}){
    return createApp(this.componentResolver(config.name), config);
  }

  componentResolver(name){
    switch (name) {
      default:
        return Dialog;
    }
  }
}