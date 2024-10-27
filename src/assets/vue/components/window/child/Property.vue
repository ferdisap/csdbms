<script>
import { formDataToObject } from '../../../../js/util/helper';
import TitleBar from '../../gui/TitleBar.vue';

function style() {
  const t = ((top.innerHeight / 2) - 400); 
  const l = ((top.innerWidth / 2) - 300);
  return {
    position: 'absolute',
    width: '600px',
    height: '800px',
    top: ((t > 0 ? t : 0) + 'px'),
    left: ((l > 0 ? l : 0) + 'px'),
    backgroundColor: '#ffffff',
  }
}
export {style}

/**
 * Tidak seperti Alert dan Dialog, Property bisa reject karena 
 * misal jika user ingin buat commment pakai property window, jika cancel maka logic creating comment di vueComponent akan dihentikan
 * 
 * parameter yes(param) adalah property component dan akan direturn props nya
*/
const property = function () {
  let resolve = undefined;
  let reject = undefined;

  const promise = new Promise((r, j) => {
    resolve = r;
    reject = j;
  })

  const yes = (data) => resolve(data);
  const no = () => reject(false);
  const result = () => promise;
  return { yes, no, result, data: null };
}
export {property}

/**
 * jika memerlukan cara mengubah form untuk di set di props, bind fungsi ini di vueComponent
*/
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
    useButton: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    getOwnerWindow(){
      return top.document.getElementById(this._.appContext.app.windowId)
    },
    yes() {
      const data = formDataToObject(new FormData(this.$el.parentElement.querySelector("form")));
      this.getOwnerWindow().property.yes(data);
      this.$el.dispatchEvent(new Event('close-window'));
    },
    no(){
      this.getOwnerWindow().property.no();
      this.$el.dispatchEvent(new Event('close-window'));
    }
  },
}
</script>
<template>
  <div class="property h-full w-full border shadow-md">
    <TitleBar :sizing-button="false" :hide-button="false" :title="$props.title" :cache-button="false"/>
    <div class="px-3 py-1 h-[calc(100%-3rem)] overflow-auto">
      <div class="mt-2">
        <slot name="content"></slot>
      </div>

      <div v-if="useButton" class="text-center mt-2 mb-2 space-x-2">
        <button @click="this.yes" class="bg-slate-200 hover:bg-slate-300 shadow-md px-2 py-1 rounded-md font-bold">Yes</button>
        <button @click="this.no" class="bg-slate-200 hover:bg-slate-300 shadow-md px-2 py-1 rounded-md font-bold">No</button>
      </div>
    </div>
  </div>
</template>