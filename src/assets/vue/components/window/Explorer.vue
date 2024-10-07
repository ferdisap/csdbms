<script>
import TitleBar from '../gui/TitleBar.vue';
import Tes from './sub/Tes.vue';
export default {
  components: { TitleBar, Tes }
}
</script>
<template>
  <div class="explorer h-full w-full border shadow-md">
    <TitleBar />
    <div class="mt-5 px-3 py-5">
      this is Explorer
    </div>
    <Tes/>
  </div>
</template>