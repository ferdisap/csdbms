<script>
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import axios from 'axios';
import config from '../../../config.json';
import { auth } from '../../../js/Auth';
import { maphilight, uninstall } from '../../../../complementary/myMapHilight';

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
    top.imf = this;
    top.maphilight = maphilight;
    this.$el.closest('.app-window').addEventListener('window-resized',(e) => {
      const imfImage = this.$el.querySelector('.imfContent img');
      const imfMap = document.querySelector('map[name="' + imfImage.getAttribute('usemap').substring(1) + '"]');
      uninstall(imfMap, imfImage);
      maphilight(imfImage);
    })
  }
}
</script>
<template>
  <div class="icn h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="ICN Metadata File"/>
    <div class="h-[calc(100%-3rem)] w-full imf-content-container">

    </div>
  </div>
</template>