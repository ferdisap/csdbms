<script>
import FloatMenu from '../menu/FloatMenu.vue';
import WidgetDate from './sub/WidgetDate.vue'
import WidgetSavedWindow from './sub/WidgetSavedWindow.vue';

/**
 * Desktop ini dipakai untuk menampilkan localstorage key 'cached-window'
 */
export default {
  components: { FloatMenu, WidgetDate, WidgetSavedWindow },
  mounted() {
    const url = new URL(top.location);
    if (url.searchParams.has('id')) openWindow({appId: url.searchParams.get('id')});
  }
}
</script>

<template>
  <div id="app-desktop" class="relative h-full w-full bg-slate-800">
    <!-- savedWindow -->
    <WidgetSavedWindow/>
    <!-- watch -->
    <WidgetDate/>    
  </div>
</template>
