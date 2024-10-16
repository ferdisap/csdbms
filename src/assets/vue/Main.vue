<script>
import TitleBar from './components/gui/TitleBar.vue';
import TaskBar from './components/gui/TaskBar.vue';
import Content from './components/gui/Content.vue';
import FloatMenu from './components/menu/FloatMenu.vue';
import Desktop from './components/gui/Desktop.vue';
import Flash from './components/sub/Flash.vue';

export default {
  components: { Flash, TitleBar, Content, TaskBar, FloatMenu, Desktop },
  methods:{
    showDesktop(){
      const showAll = !this.$window.showAll;
      const evt = new Event("hideshow-window");
      evt.data = {state:showAll};
      top.dispatchEvent(evt)
    }
  }
}
</script>

<template>
  <div class="main h-full w-full z-10">
    <Flash/>
    <div id="app-content-container" class="w-full h-[96.5%] relative bg-yellow-200 z-10">
      <Desktop/>
      <Content/>
    </div>
    <div id="app-task-container" class="w-full h-[3%] relative z-20">
      <TaskBar/>
    </div>
    <FloatMenu :trigger="[{triggerId: 'app-content-container', on: 'contextmenu'}]" :use-copy-btn="false">
      <div class="list" @click="showDesktop">
        <div>Show desktop</div>
      </div>
    </FloatMenu>
  </div>
</template>
