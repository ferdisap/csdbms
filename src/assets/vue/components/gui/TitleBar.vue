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
  props:{
    title: {
      type: String,
      default: 'Technical Publication'
    },
    hideButton: {
      type: Boolean,
      default: true,
    },
    sizingButton: {
      type: Boolean,
      default: true,
    },
    closeButton: {
      type: Boolean,
      default: true,
    },
    cacheButton: {
      type: Boolean,
      default: true,
    },
    bgColor: {
      type: String,
      default: 'bg-blue-500'
    }
  },
  methods: {
    sizing(event){
      this.isMaximize = top.mainApp.config.globalProperties.$window.sizing(event);
    },
    hide(event){
      const evt = new Event('toggle-window');
      evt.data = {windowEl: event.target.closest(".app-window")};
      this.$el.dispatchEvent(evt);
    },
    close(){
      this.$el.dispatchEvent(new Event('close-window'));
    },
    cache(){
      const e = new Event('cache-window');
      e.data = {
        component: this
      }
      top.document.dispatchEvent(e);
    }
  },
  mounted(){
    this.isMaximize = this.$el.closest('.app-window').isMaximize;
    // window.tt = this;
  },
}
</script>

<template>
  <nav :class="[$props.bgColor,'titlebar bg-blue-500 text-white h-12 relative flex']">
    <div @pointerdown="($props.sizingButton ? (this.isMaximize = false) : null)" class="trigger-move h-full w-full flex justify-between items-center mr-2">
      <span href="/" class="text-lg float-start ml-3 font-bold">{{ $props.title }}</span>
    </div>
    <div class="py-3 mr-3 flex space-x-2">
      <div v-if="$props.cacheButton" @click="cache" class="h-6 w-6 shadow-sm bg-orange-400 text-center hover:bg-orange-600 rounded-full hover:cursor-pointer"><i class="material-symbols-outlined text-base font-extrabold">save</i></div>
      <div v-if="$props.hideButton" @click="hide" class="h-6 w-6 shadow-sm bg-green-500 text-center hover:bg-green-600 rounded-full hover:cursor-pointer"><i class="material-symbols-outlined text-base font-extrabold">minimize</i></div>
      <div v-if="$props.sizingButton" @click="sizing" class="h-6 w-6 shadow-sm bg-yellow-500 text-center hover:bg-yellow-700 rounded-full hover:cursor-pointer"><i class="material-symbols-outlined text-base font-extrabold">{{ isMaximize ? 'close_fullscreen' : 'expand_content' }}</i></div>
      <div v-if="$props.closeButton" @click="close" class="h-6 w-6 shadow-sm bg-red-600 text-center hover:bg-red-700 rounded-full hover:cursor-pointer"><i class="material-symbols-outlined text-base font-extrabold">close</i></div>
    </div>
  </nav>
</template>