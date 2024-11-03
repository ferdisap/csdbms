<script>
import TitleBar from '../gui/TitleBar.vue';
import ListTree from './sub/ListTree.vue';
import Tes from './sub/Tes.vue';
import Folder from './sub/Folder.vue';
import { auth } from '../../../js/Auth';
import { getCsdbData } from '../../../js/util/S1000DHelper';

export default {
  data(){
    return{
      // auth: auth()
      // path: '',
      csdb: {},
    }
  },
  emits:['tes'],
  components: { TitleBar, ListTree, Folder, Tes },
  methods:{
    clickFilenameFromListtree(url){
      url = new URL(url)
      this.csdb = getCsdbData(url.pathname);
      this.csdb.access_key = url.searchParams.get('access_key');
    },
    clickFolderFromListtree(path){
      this.csdb = getCsdbData(path);
      this.csdb.access_key = undefined
    }
  },
  mounted(){
    // top.exp = this;
    // top.auth = this.auth;
  }
}
</script> 
<template>
  <div class="explorer h-full w-full border shadow-md">
    <TitleBar title="Explorer"/>
    <div class="flex h-[calc(100%-3rem)] space-x-2 w-full">
      <div class="h-full w-72">
        <ListTree @clickFilename="clickFilenameFromListtree" @clickFolder="clickFolderFromListtree"/>
      </div>
      <div class="w-[calc(100%-18rem)] h-full">
        <!-- <Folder status="act" :path="path"/> -->
        <Folder status="act" :path="csdb.path" :access_key="csdb.access_key"/>
      </div>
    </div>
  </div>
</template>