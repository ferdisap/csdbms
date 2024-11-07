<script>
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import axios from 'axios';
import config from '../../../config.json';
import { auth } from '../../../js/Auth';
import { maphilight } from '../../../../complementary/myMapHilight';

export default {
  components:{TitleBar, ContinuousLoadingCircle},
  props: {
    filename: { type: String },
    access_key: { type: String }
  },
  methods:{
    request(){
      axios.get("/api/s1000d/csdb/read/" + this.$props.filename + '?form=html' +
        (this.$props.access_key ? ('&access_key=' + this.$props.access_key) : '') + 
        (auth().user.accessKey ? ('&user_access_key=' + auth().user.accessKey.key) : ''))
      .then(rsp => {
        top.rsp = rsp;
        const html = Document.parseHTMLUnsafe(rsp.data)
        const imfContent = html.querySelector(".imfContent")
        imfContent.querySelectorAll("[src]").forEach(el => {
          el.src = el.src.replace(/s1000d:\/?/,config.CSDB_HOST + '/api/s1000d/csdb/read/');
          el.src += (auth().user.accessKey ? ('?user_access_key=' + auth().user.accessKey.key) : '');
          maphilight(el);
        })
        this.$el.querySelector('.imf-content-container').appendChild(imfContent);
      })
    },
  },
  mounted(){
    this.request();
  }
}
</script>
<template>
  <div class="icn h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="Information Control Number"/>
    <div class="h-[calc(100%-3rem)] w-full imf-content-container">

    </div>
  </div>
</template>