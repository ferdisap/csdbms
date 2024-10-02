<script>
import { mainStore } from '../../../js/MainStore.js'
import Randomstring from 'randomstring';
export default {
  data(){
    return {
      mainStore: mainStore(),
  }
  },
  beforeMount() {
    if (!this.$parent.componentId) {
      this.$parent.componentId = Randomstring.generate({charset:'alphabetic'});
    }
    mainStore().componentLoadingProgress[this.$parent.componentId] = false;

  },
  mounted(){
    this.$el.parentElement.style.position = 'relative';
  }
}
</script>
<template>
   <div v-if="mainStore.componentLoadingProgress[$parent.componentId]" class="clc">
    <div class="clc-buffer" />
  </div>
</template>