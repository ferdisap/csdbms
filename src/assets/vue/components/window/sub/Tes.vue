<script>
import {useCache} from '../../../../js/plugin/sub/WindowCache'; 
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

    <!-- <FloatMenu :trigger="[{triggerId: 'app-content-container', on: 'contextmenu'}]">
      <div class="list">
        <div>test</div>
      </div>
      <div class="list">
        <div class="w-full">
          test
          <span id="level2" class="float-end">open</span>
        </div>
      </div>
      <div class="list">
        <div>test</div>
      </div>
      <div class="list">
        <div>test</div>
      </div>
      <div class="list">
        <div class="w-full">
          test
          <span id="lagilevel2" class="float-end">open</span>
        </div>
      </div>
    </FloatMenu>
    <FloatMenu :trigger="[{triggerId: 'level2', on: 'pointerover'}]" level="1">
      <div class="list">
        <div>tes level 2</div>
      </div>
      <div class="list">
        <div>tes level 2</div>
      </div>
    </FloatMenu>
    <FloatMenu :trigger="[{triggerId: 'lagilevel2', on: 'mouseover'}]" level="1">
      <div class="list">
        <div>tes level 2</div>
      </div>
      <div class="list">
        <div>tes level 2</div>
      </div>
    </FloatMenu> -->

  </div>
</template>