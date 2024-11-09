<script>
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import axios from 'axios';
import config from '../../../config.json';
import { auth } from '../../../js/Auth';
import { maphilight, uninstall, anchorHover } from '../../../../complementary/myMapHilight';

export default {
  components: { TitleBar, ContinuousLoadingCircle },
  props: {
    filename: { type: String },
    access_key: { type: String }
  },
  methods: {
    async request() {
      if (!auth().user.accessKey) await auth().check()
      axios.get("/api/s1000d/csdb/read/" + this.$props.filename + '?form=html' +
        (this.$props.access_key ? ('&access_key=' + this.$props.access_key) : '') +
        ('&user_access_key=' + auth().user.accessKey.key))
        .then(rsp => {
          const html = Document.parseHTMLUnsafe(rsp.data);
          [...html.querySelectorAll(".icnVariation")].forEach(icnVariation => {
            const mime = icnVariation.getAttribute('mime');
            if (mime.includes('image')) {
              return this.handleImage(icnVariation)
            }
          })

          // const imfContent = html.querySelector(".imfContent")
          // imfContent.querySelectorAll("[src]").forEach(el => {
          //   el.src = el.src.replace(/s1000d:\/?/, config.CSDB_HOST + '/api/s1000d/csdb/read/');
          //   el.src += (auth().user.accessKey ? ('?user_access_key=' + auth().user.accessKey.key) : '');
          //   maphilight(el);
          // })
          // this.$el.querySelector('.imf-content-container').appendChild(imfContent);
        })
    },
    handleImage(icnVariation) {
      const windowApp = this.$el.closest('.app-window');
      icnVariation.querySelectorAll("[src]").forEach(imfImage => {
        imfImage.src = imfImage.src.replace(/s1000d:\/?/, config.CSDB_HOST + '/api/s1000d/csdb/read/');
        imfImage.src += (auth().user.accessKey ? ('?user_access_key=' + auth().user.accessKey.key) : '');
        maphilight(imfImage);
        windowApp.addEventListener('window-resized', () => {
          const imfMap = document.querySelector('map[name="' + imfImage.getAttribute('usemap').substring(1) + '"]');
          if(!imfMap) return;
          uninstall(imfMap, imfImage);
          maphilight(imfImage);
        });
      })
      const imfContent = this.$el.querySelector('.imf-content');
      // add icnVariation
      const imfVariationContainer = document.createElement('div');
      imfVariationContainer.setAttribute('class', 'imf-variation-container');
      imfVariationContainer.appendChild(icnVariation)
      imfVariationContainer.style.width = '100%';
      imfVariationContainer.style.height = '100%';
      imfContent.appendChild(imfVariationContainer);
      // add list area
      const imfAreas = document.createElement('div');
      imfAreas.setAttribute('class', 'imf-areas-container');
      [...icnVariation.querySelectorAll('area')].forEach(area => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        details.appendChild(summary);
        summary.textContent = area.id;
        details.append(area.getAttribute('coords'));
        details.setAttribute('href', '#' + area.id);
        imfAreas.appendChild(details);
        details.addEventListener('mouseover', anchorHover)
      });
      imfContent.insertBefore(imfAreas, imfVariationContainer);
    }
  },
  mounted() {
    this.request();
    top.imf = this;
    top.maphilight = maphilight;
  }
}
</script>
<template>
  <div class="icn h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="ICN Metadata File" />
    <div class="h-[calc(100%-3rem)] w-full imf-content">

    </div>
  </div>
</template>