import Property from '../../../vue/components/window/child/Property.vue';
import { createApp } from 'vue';

export default class WindowProperty{
  constructor(config = {}){
    return createApp(this.componentResolver(config.name), config);
  }

  componentResolver(name){
    switch (name) {
      default:
        return Property;
    }
  }
}