<script>
export default {
  data(){
    return {
    }
  },
  props:{
    title: {
      type: String,
    }
  },
  methods:{
    toggle(event){
      top.mainApp.config.globalProperties.$window.toggle({task: event.target.closest(".window-task")});
    }
  }
}
</script>
<template>
  <div class="task min-w-24 h-full flex items-center text-base shadow-md px-2 hover:bg-gray-700 text-nowrap" @click.stop="toggle">{{ $props.title }}</div>  
</template>