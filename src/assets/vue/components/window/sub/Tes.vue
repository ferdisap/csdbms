<script>
import {useCache} from '../../../../js/plugin/WindowCache'; 
export default {
  props: {
    text: {
      type: String,
      default: 'before changed'
    }
  },
  methods: {
    cache() {
      const e = new Event('cache-window');
      e.data = {
        component: this
      }
      top.document.dispatchEvent(e);
    },
    changeProps(key, value){
      this._.props[key] = value;
    }
  },
  beforeCreate() {
    useCache.apply(this);
  },
  mounted() {
    window.tes = this;
  }
}
</script>
<template>
  <div class="tes">ini tes vue
    <div>
      child text: {{ $props.text }}
    </div>
    <button @click="cache">CACHE</button>
    <button @click="changeProps('text','foo')">change into Foo</button>
    <button @click="changeProps('text','bar')">change into bar</button>
  </div>
</template>