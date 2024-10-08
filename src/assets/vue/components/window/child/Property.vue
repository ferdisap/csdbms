<script>
import { formDataToObject } from '../../../../js/util/helper';
import TitleBar from '../../gui/TitleBar.vue';

const property = function () {
  let resolve = undefined;
  let reject = undefined;

  const promise = new Promise((r, j) => {
    resolve = r;
    reject = j;
  })

  const yes = (component) => resolve(component._.props);
  const no = () => reject(false);
  const result = () => promise;
  return { yes, no, result };
}
export {property}

const setPropsByHTMLForm = function(event){
  event.preventDefault();  
  const form = formDataToObject(new FormData(event.target));
  Object.keys(form).forEach((v,i) => {
    this._.props[i] = v;
  });
} 

export {setPropsByHTMLForm}

/**
 * usahakan semua form name ada di props juga
*/
export default {
  components: { TitleBar },
  props: {
    title: {
      type: String,
      default: 'Property Window'
    },
  },
  methods: {
    yes() {
      top.document.getElementById(this._.appContext.app.windowId).dialog.yes();
      this.$el.dispatchEvent(new Event('close-window'));
    },
    no(){
      top.document.getElementById(this._.appContext.app.windowId).dialog.no();
      this.$el.dispatchEvent(new Event('close-window'));
    }
  },
}
</script>
<template>
  <div class="h-full w-full border shadow-md">
    <TitleBar :sizing-button="false" :hide-button="false" :title="$props.title" :cache-button="false"/>
    <div class="px-3 py-1">
      <div class="mt-2">
        <slot name="content"></slot>
      </div>

      <div class="text-center mt-2 mb-2 space-x-2">
        <button @click="this.yes" class="bg-slate-200 shadow-md px-2 py-1 rounded-md font-bold">Yes</button>
        <button @click="this.no" class="bg-slate-200 shadow-md px-2 py-1 rounded-md font-bold">No</button>
      </div>
    </div>
  </div>
</template>