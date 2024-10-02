<script>
import ContextMenu from  "../menu/ContextMenu.vue";
import { auth } from "../../../js/Auth";
import StartMenu from "../menu/StartMenu.vue";
import { mainStore } from '../../../js/MainStore';
export default {
  data(){
    return {
      mainStore: mainStore(),
      auth: auth(),
      active: new Map(),
      // astate: this.$window.activeState,
      // astate: ref(this.$window.activeState)
    }
  },
  components:{ ContextMenu, StartMenu},
  computed:{
  },
  methods: {
    startMenu(){
      document.dispatchEvent(new Event('start-menu'));
    },
  },
  methods:{
    
  },
  beforeMount(){
  },
  mounted(){
    window.taskbar = this;
  }
}
</script>
<template>
  <div class="taskbar h-full w-full">
    <nav class="z-[200] bottom-0 w-full bg-gray-500 text-white h-12 flex items-center shadow-md">
      <!-- start menu -->
      <div class="flex h-full mr-2 float-start">
        <div trigger-start-menu @click.prevent.stop="startMenu" class="min-w-6 h-full flex items-center px-1 hover:bg-gray-700 hover:cursor-pointer">
          <span class="material-symbols-outlined ">menu</span>
        </div>
        <div class="min-w-6 h-full flex items-center px-1 hover:bg-gray-700 hover:cursor-pointer">
          <span class="material-symbols-outlined ">search</span>
        </div>
      </div>
  
      <!-- window task -->
      <div id="app-windowtask" class="flex h-full mr-2">
        <ContextMenu id="taskbar-tasks">
          <div class="list">
            <div class="">close</div>
          </div>
        </ContextMenu>
      </div>
  
      <!-- login state -->
      <div class="h-full flex items-center justify-end py-3 mr-3 w-full">
        <div :class="[auth.isAuth ? 'bg-blue-600' : 'bg-red-600','h-6 w-6 float-end text-center rounded-full']"><span class="material-symbols-outlined text-base font-bold">account_circle</span></div>
        <ContextMenu id="taskbar-account">
          <div v-if="auth.isAuth" class="list">
            <div class="">login</div>
          </div>
          <div v-else class="list">
            <div class="">logout</div>
          </div>
        </ContextMenu>
      </div>
    </nav>
    <StartMenu/>
  </div>
</template>