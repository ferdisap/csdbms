<script>
import TitleBar from './components/gui/TitleBar.vue';
import TaskBar from './components/gui/TaskBar.vue';
import Content from './components/gui/Content.vue';
import FloatMenu from './components/menu/FloatMenu.vue';
import Desktop from './components/gui/Desktop.vue';

export default {
  data() {
    return {
      techpubStore: {},
      infoData: {}, // requiredAttribute: 'show:Boolean', 'message:String', 'name:String'
      alertData: {},
      tasks: [],
    }
  },
  components: { TitleBar, Content, TaskBar, FloatMenu, Desktop },
  mounted() {
    // window.main = this;
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
      <div class="list">
        <div>test</div>
      </div>
      <div class="list">
        <div class="w-full">
          test
          <span id="level2" class="float-end">open</span>
        </div>
      </div>
      <div class="list">
        <div>test</div>
      </div>
      <div class="list">
        <div>test</div>
      </div>
      <div class="list">
        <div class="w-full">
          test
          <span id="lagilevel2" class="float-end">open</span>
        </div>
      </div>
    </FloatMenu>
    <FloatMenu :trigger="[{triggerId: 'level2', on: 'pointerover'}]" level="1">
      <div class="list">
        <div>tes level 2</div>
      </div>
      <div class="list">
        <div>tes level 2</div>
      </div>
    </FloatMenu>
    <FloatMenu :trigger="[{triggerId: 'lagilevel2', on: 'mouseover'}]" level="1">
      <div class="list">
        <div>tes level 2</div>
      </div>
      <div class="list">
        <div>tes level 2</div>
      </div>
    </FloatMenu>
  </div>
</template>
