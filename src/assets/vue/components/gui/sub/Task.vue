<script>
export default {
  data(){
    return {
    }
  },
  props:{
    title: {
      type: String,
      default: 'tes foo'
    }
  },
  methods:{
    toggle(event){
      top.mainApp.config.globalProperties.$task.toggle({task: event.target.parentElement});
    }
  }
}
</script>
<template>
  <div class="task min-w-24 h-full flex items-center text-base shadow-md px-2 hover:bg-gray-700" @click.stop="toggle">{{ $props.title }}</div>  
</template>