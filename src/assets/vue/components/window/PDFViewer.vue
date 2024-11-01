<script>
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import axios from 'axios';
import { useCache } from '../../../js/plugin/sub/WindowCache';
export default {
  components:{ContinuousLoadingCircle,TitleBar},
  props: {
    filename: {
      type: String,
    },
    access_key:{
      type: String,
    },
  },
  data(){
    return {
      src: undefined
    }
  },
  methods:{
    request(filename, access_key){
      this.clp(true);
      axios({
        url: "/api/s1000d/csdb/read/" + filename + '?form=pdf' +(access_key ? '&access_key=' + access_key : ''),
        method: 'GET',
        responseType: 'arraybuffer'
      })
        .then(async (rsp) => {
          const blob = new Blob([rsp.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          this.src = url;
        })
        .finally(()=>this.clp(false));
    },
  },
  beforeCreate() {
    useCache.apply(this);
  },
  mounted(){
    if(this.$props.filename){
      this.request(this.$props.filename, this.$props.access_key);
    }
  }
}
</script>
<template>
  <div class="dml h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="PDF Viewer" />
    <div class="h-[calc(100%-3rem)] w-full">
      <div class="p-4 w-full h-full">
        <h1 class="w-full mb-3 mt-2 font-bold text-lg h-12">{{ $props.filename }}</h1>
        <div v-if="src" class="flex justify-center h-[calc(100%-3.5rem)] w-full">
          <iframe class="border-2 p-4 h-full w-full" :src="src" loading="lazy" referrerpolicy="same-origin"/>
        </div>
      </div>
      <ContinuousLoadingCircle/>
    </div>
  </div>
</template>