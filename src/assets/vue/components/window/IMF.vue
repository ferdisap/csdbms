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
      const imfVariationContainer = document.createElement('div');
      const imfLeftSide = document.createElement('div');
      imfLeftSide.setAttribute('class', 'imf-left-side');
      imfContent.appendChild(imfLeftSide)
      
      // add imf ident status
      const imfMetaContainer = document.createElement('div');
      imfMetaContainer.setAttribute('class', 'imf-meta-container');
      const html = icnVariation.closest('html');
      const imfIdentIcn = html.firstElementChild.querySelector("meta[name=imfIdentIcn]").getAttribute('content');
      const issueNumber = html.firstElementChild.querySelector("meta[name='issueNumber']").getAttribute('content');
      const inWork = html.firstElementChild.querySelector("meta[name='inWork']").getAttribute('content');
      const legacyIdent = [...html.firstElementChild.querySelectorAll("meta[name='legacyIdent']")].map(meta => meta.getAttribute('content')).join(", ");
      const icnKeyword = [...html.firstElementChild.querySelectorAll("meta[name='icnKeyword']")].map(meta => meta.getAttribute('content')).join(", ");
      const securityClassification = html.firstElementChild.querySelector("meta[name='securityClassification']").getAttribute('content');
      const [rspEnterpriseCode, rspEnterpriseName] = html.firstElementChild.querySelector("meta[name='responsiblePartnerCompany']").getAttribute('content').split(";");
      const [origEnterpriseCode, origEnterpriseName] = html.firstElementChild.querySelector("meta[name='originator']").getAttribute('content').split(";");
      const brexDmRef = html.firstElementChild.querySelector("meta[name='brexDmRef']").getAttribute('content');
      imfMetaContainer.innerHTML = `
       <h1>IMF Ident Status</h1>
       <div><code class="att">@imfIdentIcn</code>:<code class="val">${imfIdentIcn}</code></div>
       <div><code class="att">@issueNumber</code>:<code class="val">${issueNumber}</code></div>
       <div><code class="att">@inWork</code>:<code class="val">${inWork}</code></div>
       <div><code class="att">@legacyIdent</code>:<code class="val">${legacyIdent}</code></div>
       <div><code class="att">@icnKeyword</code>:<code class="val">${icnKeyword}</code></div>
       <div><code class="att">@securityClassification</code>:<code class="val">${securityClassification}</code></div>
       <div><code class="att">@brexDmRef</code>:<code class="val">${brexDmRef}</code></div>
       <div>
          <code class="att tp-left-1 tp-top" data-tooltip="code: ${rspEnterpriseCode}">@responsiblePartnerCompany</code>
          <code class="val">${rspEnterpriseName}</code></div>
        </div>
       <div>
          <code class="att tp-right-3 tp-top" data-tooltip="code: ${origEnterpriseCode}">@originator</code>
          <code class="val">${origEnterpriseName}</code></div>
        </div>
      `.replace(/\n/gm,'');
      imfLeftSide.appendChild(imfMetaContainer);

      // add area to img
      imfVariationContainer.setAttribute('class', 'imf-variation-container');
      imfVariationContainer.appendChild(icnVariation)
      imfVariationContainer.style.width = '100%';
      imfVariationContainer.style.height = '100%';
      imfContent.appendChild(imfVariationContainer);      

      // add list area
      const imfAreasContainer = document.createElement('div');
      imfAreasContainer.setAttribute('class', 'imf-areas-container');
      imfAreasContainer.innerHTML = '<h1>IMF Area Hotspot</h1>';
      [...icnVariation.querySelectorAll('area')].forEach(area => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = area.id;
        summary.setAttribute('class', 'tp-top');
        summary.setAttribute('data-tooltip', area.getAttribute('alt'))
        details.innerHTML = ('<p class="'+ area.getAttribute('shape') +'">'+area.getAttribute('coords').split(",").map((v,i) => '<code class="tp-top" data-tooltip="'+ ( !(i % 2) ? ('x' + Math.floor((i/2)+1)) : ('y' + Math.floor((i/2)+1))) +'">'+v+'</code>').join(', ')+'</p>');
        details.setAttribute('href', '#' + area.id);
        imfAreasContainer.appendChild(details);
        details.prepend(summary);
        details.addEventListener('mouseover', anchorHover)
      });
      // imfContent.insertBefore(imfAreasContainer, imfVariationContainer);
      imfLeftSide.appendChild(imfAreasContainer);
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
    <div class="h-[calc(100%-3rem)] w-full imf-content"></div>
  </div>
</template>