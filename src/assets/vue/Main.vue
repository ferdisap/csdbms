<script>
import TitleBar from './components/gui/TitleBar.vue';
import TaskBar from './components/gui/TaskBar.vue';
import Content from './components/gui/Content.vue';

export default {
  data() {
    return {
      techpubStore: {},
      infoData: {}, // requiredAttribute: 'show:Boolean', 'message:String', 'name:String'
      alertData: {},
      tasks: [],
    }
  },
  components: { TitleBar, Content, TaskBar },
  beforeMount() {
  },
  mounted() {
    window.app = this;
  }
}
</script>

<template>
  <div class="w-full h-[95%] relative">
    <Content />
  </div>
  <div class="w-full h-[5%]">
    <TaskBar/>
  </div>
</template>
