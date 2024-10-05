<script>
import ContextMenu from  "../menu/ContextMenu.vue";
import { auth } from "../../../js/Auth";
import StartMenu from "../menu/StartMenu.vue";
import { mainStore } from '../../../js/MainStore';
import AuthMenu from "../menu/AuthMenu.vue";
import FloatMenu from "../../components/menu/FloatMenu.vue";
import Randomstring from 'randomstring';
export default {
  data(){
    return {
      mainStore: mainStore(),
      auth: auth(),

      // menu
      componentId: Randomstring.generate({charset:'alphabetic'}),
      authmenu: false,
    }
  },
  components:{ StartMenu, AuthMenu, FloatMenu},
  methods: {
    startMenu(){
      document.dispatchEvent(new Event('start-menu'));
    },
    close(){
      this.$window.stopTask(this.$window.getTaskByElement(this.FloatMenu.anchor.closest('.window-task')));
    }
  },
  mounted(){
    window.taskbar = this;
  }
}
</script>
<template>
  <div :id="componentId" class="taskbar h-full w-full absolute z-[200]">
    <nav class="z-[200] bottom-0 h-full w-full bg-gray-500 text-white flex items-center shadow-md">
      <!-- start menu -->
      <div class="flex h-full mr-2 float-start">
        <div @click.prevent.stop="startMenu" class="min-w-6 h-full relative flex items-center px-1 hover:bg-gray-700 hover:cursor-pointer">
          <span class="material-symbols-outlined ">menu</span>
          <StartMenu/>
        </div>
        <div class="min-w-6 h-full flex items-center px-1 hover:bg-gray-700 hover:cursor-pointer">
          <span class="material-symbols-outlined ">search</span>
        </div>
      </div>
  
      <!-- window task -->
      <div id="app-windowtask" class="flex h-full mr-2">
        <!-- tempatnya task -->
      </div>
  
      <!-- other, eg: login state -->
      <div class="h-full flex items-center justify-end py-3 mr-3 w-full">
        <div id="auth-menu" :class="[auth.isAuth ? 'bg-blue-600' : 'bg-red-600','relative h-6 w-6 float-end text-center rounded-full hover:bg-gray-700 hover:cursor-pointer']">
          <span class="material-symbols-outlined text-base font-bold">account_circle</span>
        </div>
      </div>
    </nav>
    <FloatMenu :trigger="[{triggerId: componentId, on: 'contextmenu'}]">
      <div class="list">
        <div @click="close">close</div>
      </div>
    </FloatMenu>
    <FloatMenu :trigger="[{triggerId: 'auth-menu', on: 'click'}]">
      <AuthMenu/>
    </FloatMenu>
  </div>
</template>