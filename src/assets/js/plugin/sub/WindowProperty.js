import Property from '../../../vue/components/window/child/Property.vue';
import PropertyDmlEntry from '../../../vue/components/window/child/PropertyDmlEntry.vue';
import { createApp } from 'vue';

export default class WindowProperty{
  constructor(config = {}){
    const app = createApp(this.componentResolver(config.name), config.props);
    app.use(top.pinia);
    app.config.globalProperties.$ersp = top.ersp;
    return app;
  }

  componentResolver(name){
    switch (name) {
      case 'PropertyDmlEntry':
        return PropertyDmlEntry;
      default:
        return Property;
    }
  }
}