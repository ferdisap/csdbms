<script>
import TitleBar from '../gui/TitleBar.vue';
import Folder from './sub/Folder.vue';

export default {
  components:{ Folder, TitleBar },
}

</script>
<template>
  <div class="trash h-full w-full border shadow-md">
    <TitleBar title="Trash"/>    
    <div class="flex h-[calc(100%-3rem)] space-x-2 w-full">
      <Folder status="dct"/>
    </div>
  </div>
</template>