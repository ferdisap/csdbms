<script>
/**
 * HOW TO USE
 * attach <ContinuousLoadingCircle /> in your vue template
 * run this.$emit('clp', true) from your vue template to show loading circle
 * run this.$emit('clp', false) from your vue template to unshow loading circle * 
*/
export default {
  data(){
    return {
      show: false,
  }
  },
  beforeMount() {
    this.$parent.clp = (state) => this.show = state;
  },
  mounted(){
    this.$el.parentElement.style.position = 'relative';
  }
}
</script>
<template>
   <div class="clc" v-if="show">
    <div class="clc-buffer" />
  </div>
</template>