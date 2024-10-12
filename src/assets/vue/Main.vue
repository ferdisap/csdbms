<script>
import TitleBar from './components/gui/TitleBar.vue';
import TaskBar from './components/gui/TaskBar.vue';
import Content from './components/gui/Content.vue';
import FloatMenu from './components/menu/FloatMenu.vue';
import Desktop from './components/gui/Desktop.vue';

export default {
  components: { TitleBar, Content, TaskBar, FloatMenu, Desktop },
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
  <div class="main h-full w-full">
    <div id="app-content-container" class="w-full h-[96.5%] relative bg-yellow-200">
      <Desktop/>
      <Content/>
    </div>
    <div class="w-full h-[3%] relative">
      <TaskBar/>
    </div>
    <FloatMenu :trigger="[{triggerId: 'app-content-container', on: 'contextmenu'}]">
      <div class="list" @click="showDesktop">
        <div>Show desktop</div>
      </div>
    </FloatMenu>
  </div>
</template>
