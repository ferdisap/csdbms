<script>
import TitleBar from '../gui/TitleBar.vue';
import ListTree from './sub/ListTree.vue';
import Tes from './sub/Tes.vue';
import Folder from './sub/Folder.vue';
import { auth } from '../../../js/Auth';

export default {
  data(){
    return{
      auth: auth()
    }
  },
  components: { TitleBar, ListTree, Folder, Tes },
  mounted(){
    top.exp = this;
    top.auth = this.auth;
  }
}
</script>
<template>
  <div class="explorer h-full w-full border shadow-md">
    <TitleBar title="Explorer"/>
    <div class="flex h-[calc(100%-3rem)] space-x-2 w-full">
      <div class="h-full w-72">
        <ListTree/>
      </div>
      <div class="w-[calc(100%-18rem)] h-full">
        <Folder/>
      </div>
    </div>
  </div>
</template>