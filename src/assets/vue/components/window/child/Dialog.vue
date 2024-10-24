<script>
import TitleBar from '../../gui/TitleBar.vue';
import FloatMenu from '../../menu/FloatMenu.vue';

/**
 * Dialog selalu return resolve karena pada dasarnya user akan mengunakan 'await dialog.result()'
 * 
 * meski di close menggunakan title bar, itu tidak akan menjalankan fungsi no(). Itu juga akan menghentikan logic script setelah 'await dialog.result()''
*/
const dialog = () => {
  let resolve = undefined;
  const promise = new Promise((r) => resolve = r);
  const yes = (data) => resolve(data ?? true);
  const no = () => resolve(false);
  const result = () => promise;
  return { yes, no, result };
}
export {dialog}

export default {
  data(){
    return {
      showOptions: true,
    }
  },
  components: { TitleBar, FloatMenu },
  props: {
    title: {
      type: String,
      default: 'Dialog Window'
    },
    disclosure: {
      type: String,
      default: ''
    },
    instruction: {
      type: String,
      default: ''
    },
    options: {
      type: String,
      default: ''
    },
    footer: {
      type: String,
      default: '',
    }
  },
  methods: {
    yes() {
      if(this._.appContext.app.windowId) top.document.getElementById(this._.appContext.app.windowId).dialog.yes();
      else top.document.dialog.yes();
      this.$el.dispatchEvent(new Event('close-window'));
    },
    no(){
      if(this._.appContext.app.windowId) top.document.getElementById(this._.appContext.app.windowId).dialog.no();
      else top.document.dialog.no();
      this.$el.dispatchEvent(new Event('close-window'));
    }
  },
  // mounted() {
  //   top.dc = this;
  // }
}
</script>
<template>
  <div class="h-full w-full border shadow-md">
    <TitleBar :sizing-button="false" :hide-button="false" :title="$props.title" :cache-button="false"/>
    <div class="px-3 py-1">
      <div class="text-lg mt-2 max-h-20 overflow-auto" v-html="$props.instruction"></div>
      <div class="mt-2 h-20 overflow-auto" v-if="$slots.content">
        <slot name="content"></slot>
      </div>

      <div v-if="$props.options" class="space-x-1 mb-2" @click="showOptions = !showOptions">
        <button class="material-symbols-outlined text-base">keyboard_arrow_down</button>
        <button class="italic">More options</button>
      </div>
      <div v-if="showOptions" v-html="$props.options"></div>

      <div class="border-t-2 border-black mt-1 text-sm" v-html="$props.footer"></div>

      <div class="text-center mt-2 mb-2 space-x-2">
        <button @click="this.yes" class="bg-slate-200 hover:bg-slate-300 shadow-md px-2 py-1 rounded-md font-bold">Yes</button>
        <button @click="this.no" class="bg-slate-200 hover:bg-slate-300 shadow-md px-2 py-1 rounded-md font-bold">No</button>
      </div>
    </div>

    <!-- <FloatMenu :trigger="[{triggerId: ''}]"></FloatMenu> -->
  </div>
</template>