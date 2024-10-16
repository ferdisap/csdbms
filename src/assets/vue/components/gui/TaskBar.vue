<script>
import { auth } from "../../../js/Auth";
import StartMenu from "../menu/StartMenu.vue";
import FloatMenu from "../../components/menu/FloatMenu.vue";
import Randomstring from 'randomstring';
import {promiseState} from '../../../js/Auth.js';
import Auth from "./sub/Auth.vue";
export default {
  data() {
    return {
      // menu
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
    }
  },
  components: { StartMenu, Auth, FloatMenu },
  computed:{
    isAuthenticated(){
      return (promiseState(auth().isAuth)) === "<fulfilled>: true" ? true : false;
    }
  },
  methods: {
    startMenu() {
      document.dispatchEvent(new Event('start-menu'));
    },
    close() {
      this.$window.stopTask(this.$window.getTaskByElement(top.FloatMenu.anchor.closest('.window-task')));
    },
    hideshow() {
      const showAll = !this.$window.showAll;
      const evt = new Event("hideshow-window");
      evt.data = { state: showAll };
      top.dispatchEvent(evt)
    }
  },
  mounted() {
    window.taskbar = this;
  }
}
</script>
<template>
  <div :id="componentId" class="taskbar h-full w-full absolute z-[50]">
    <nav class="z-[200] bottom-0 h-full w-full bg-gray-500 text-white flex items-center shadow-md">
      <!-- start menu -->
      <div class="flex h-full mr-2 float-start relative">
        <div @click.prevent.stop="startMenu" class="min-w-6 h-full relative flex items-center px-1 hover:bg-gray-700 hover:cursor-pointer">
          <span class="material-symbols-outlined ">menu</span>
          <StartMenu />
        </div>
      </div>

      <!-- window task -->
      <div id="app-windowtask" class="flex h-full mr-2">
        <!-- tempatnya task -->
      </div>

      <!-- other, eg: login state -->
      <div class="h-full flex items-center justify-end w-full">
        <Auth/>
        <div class="hover:bg-gray-700 w-3 text-transparent cursor-pointer h-full" @click="hideshow">_</div>
      </div>
    </nav>
    <FloatMenu :trigger="[{ triggerId: 'app-windowtask', on: 'contextmenu' }]">
      <div class="list">
        <div @click="close">close</div>
      </div>
    </FloatMenu>
  </div>
</template>