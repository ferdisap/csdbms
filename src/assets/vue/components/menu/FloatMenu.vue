<script>
import Randomstring from 'randomstring';
export default {
  data(){
    return {
      componentId: Randomstring.generate({charset:'alphabetic'}),
    }
  },
  props: {
    level: {
      default: 0
    },
    trigger:Array
  },
  mounted(){
    // top.mainApp.config.globalProperties.FloatMenu.register(this.componentId,this.trigger, parseInt(this.$props.level));
    top.FloatMenu.register(this.componentId,this.trigger, parseInt(this.$props.level));
  }
}
</script>
<template>
  <!-- <div :id="id" class="contextmenu floatmenu"> -->
  <div :id="componentId" class="floatmenu">
    <div class="container">
      <slot>
      </slot>
    </div>
  </div>
</template>