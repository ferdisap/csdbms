<script>
// import axios from 'axios';
// import { useTechpubStore } from '../../techpub/techpubStore'
// import { mount } from '@vue/test-utils';
// import WindowMove from '../../../js/plugin/sub/WindowMove';
// import { findAncestor } from '../../../js/util/helper';

export default {
  data() {
    return {
      openDropdown: false,
      isMaximize: undefined
    }
  },
  // computed:{
  //   isMaximize(){
  //     return this.$el ? this.$el.closest('.app-window').isMaximize : true
  //   }
  // },
  props:{
    title: {
      type: String,
      default: 'Technical Publication'
    }
  },
  methods: {
    sizing(event){
      this.isMaximize = top.mainApp.config.globalProperties.$window.maximize(event);      
      // top.mainApp.config.globalProperties.$window.setToTop(event.target.closest(".app-window"));
    },
    hide(event){
      top.mainApp.config.globalProperties.$window.toggle({window: event.target.closest(".app-window")});
    },
    close(event){
      top.mainApp.config.globalProperties.$window.close(event);
    }
  },
  mounted(){
    this.isMaximize = this.$el.closest('.app-window').isMaximize;
    window.tt = this;
  },
}
</script>

<template>
  <nav  class="titlebar bg-blue-500 text-white h-12 relative flex">
    <div @pointerdown="this.isMaximize = false" class="trigger-move h-full w-full flex justify-between items-center mr-2">
      <span href="/" class="text-lg float-start ml-3">{{ $props.title }}</span>
    </div>
    <div class="py-3 mr-3 flex space-x-2">
      <div @click.stop="hide" class="h-6 w-6 shadow-sm bg-green-500 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">minimize</span></div>
      <div @click.stop="sizing" class="h-6 w-6 shadow-sm bg-yellow-500 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">{{ isMaximize ? 'close_fullscreen' : 'open_in_full' }}</span></div>
      <div @click.stop="close" class="h-6 w-6 shadow-sm bg-red-600 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">close</span></div>
    </div>
  </nav>
</template>