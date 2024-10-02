<script>
// import axios from 'axios';
// import { useTechpubStore } from '../../techpub/techpubStore'
// import { mount } from '@vue/test-utils';
import WindowMove from '../../../js/plugin/sub/WindowMove';

export default {
  data() {
    return {
      openDropdown: false,
    }
  },
  props:{
    title: {
      type: String,
      default: 'Technical Publication'
    }
  },
  methods: {
    move(event){
      top.mainApp.config.globalProperties.$task.move(event);
    }
  },
  mounted(){
    // const wmove = new WindowMove();
    // wmove.attach(this.$el);
  },
}
</script>

<template>
  <!-- <nav @pointerdown.stop="top.mainApp.config.globalProperties.$task.move" class="titlebar bg-blue-500 text-white h-12 relative flex justify-between items-center"> -->
  <nav @pointerdown.stop="move" class="titlebar bg-blue-500 text-white h-12 relative flex justify-between items-center">
    <span href="/" class="text-lg float-start ml-3">{{ $props.title }}</span>
    <div class="py-3 mr-3 flex space-x-2">
      <div class="h-6 w-6 bg-red-600 text-center rounded-full"><span class="material-symbols-outlined text-base font-bold">minimize</span></div>
      <div class="h-6 w-6 bg-red-600 text-center rounded-full"><span class="material-symbols-outlined text-base font-bold">open_in_full</span></div>
      <!-- <div class="h-6 w-6 bg-red-600 text-center rounded-full"><span class="material-symbols-outlined text-base font-bold">close_fullscreen</span></div> -->
      <div class="h-6 w-6 bg-red-600 text-center rounded-full"><span class="material-symbols-outlined text-base font-bold">close</span></div>
    </div>
  </nav>
</template>