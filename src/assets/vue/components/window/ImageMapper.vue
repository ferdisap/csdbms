<script>
import TitleBar from '../gui/TitleBar.vue';
export default {
  components:{TitleBar},
}
</script>
<template>
  <div class="explorer h-full w-full border shadow-md">
    <TitleBar title="ImageMapper"/>
    <iframe src="https://ferdisap.github.io/image-map/" frameborder="0" style="height:calc(100% - 3rem);width:100%"></iframe>
  </div>
</template>