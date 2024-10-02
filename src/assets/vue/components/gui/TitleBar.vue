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
      isMaximize: true
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
      top.mainApp.config.globalProperties.$task.setToTop(event.target.closest(".app-window"));
      top.mainApp.config.globalProperties.$task.move(event);
      this.isMaximize = false;
    },
    minimize(event){
      top.mainApp.config.globalProperties.$task.minimize(event);
      this.isMaximize = false;
    },
    maximize(event){
      top.mainApp.config.globalProperties.$task.setToTop(event.target.closest(".app-window"));
      top.mainApp.config.globalProperties.$task.maximize(event);
      this.isMaximize = true;
    },
    hide(event){
      top.mainApp.config.globalProperties.$task.toggle({window: event.target.closest(".app-window")});
    },
    close(event){
      top.mainApp.config.globalProperties.$task.close(event.target.closest(".app-window"));
    }
  },
  mounted(){
    // const wmove = new WindowMove();
    // wmove.attach(this.$el);
  },
}
</script>

<template>
  <nav @pointerdown.stop="move" class="titlebar bg-blue-500 text-white h-12 relative flex justify-between items-center">
    <span href="/" class="text-lg float-start ml-3">{{ $props.title }}</span>
    <div class="py-3 mr-3 flex space-x-2">
      <div @pointerdown.stop="hide" class="h-6 w-6 shadow-sm bg-green-500 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">minimize</span></div>
      <div @pointerdown.stop="minimize" v-if="isMaximize" class="h-6 w-6 shadow-sm bg-yellow-500 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">close_fullscreen</span></div>
      <div @pointerdown.stop="maximize" v-else class="h-6 w-6 shadow-sm bg-yellow-500 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">open_in_full</span></div>
      <div @pointerdown.stop="close" class="h-6 w-6 shadow-sm bg-red-600 text-center rounded-full hover:cursor-pointer"><span class="material-symbols-outlined text-base font-bold">close</span></div>
    </div>
  </nav>
</template>