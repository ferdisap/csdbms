import Dialog from '../../../vue/components/window/child/Dialog.vue';
import { createApp } from 'vue';

export default class WindowDialog{
  /**
   * 
   * @param {Object} config contain key 'name?' and 'props'
   * @returns 
   */
  constructor(config = {}){
    return createApp(this.componentResolver(config.name), config.props);
  }

  componentResolver(name){
    switch (name) {
      default:
        return Dialog;
    }
  }
}