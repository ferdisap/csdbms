<script>
import TitleBar from '../../gui/TitleBar.vue';

const alert = () => {
  let resolve = undefined;

  const promise = new Promise(r => resolve = r);

  const ok = () => resolve(true);
  const result = () => promise;
  return { ok, result };
}

export {alert}

export default {
  components: { TitleBar },
  computed:{
    alertType(){
      switch (this.$props.type) {
        case 'warning': return 'warning';
        case 'caution': return 'error';
        default: return 'help';
      }
    },
    titleBgColor(){
      switch (this.$props.type) {
        case 'warning': return 'bg-red-500';
        case 'caution': return 'bg-yellow-400';
        default: return 'bg-gray-500';
      }
    }
  },
  props: {
    title: {
      type: String,
      default: 'Alert Window'
    },
    type: {
      type: String,
      default: 'note', // warning, caution, note
    },
    instruction: {
      type: String,
      default: 'No instruction.' // bisa berupa html string
    },
  },
  methods: {
    ok() {
      top.document.getElementById(this._.appContext.app.windowId).alert.ok();
      this.$el.dispatchEvent(new Event('close-window'));
    },
  },
  // mounted(){
  //   top.al = this;
  // }
}
</script>
<template>
  <div class="h-full w-full border shadow-md">
    <TitleBar :sizing-button="false" :hide-button="false" :title="$props.title" :cache-button="false" :close-button="false" :bg-color="titleBgColor"/>
    <div class="px-3 py-1">
      <div class="min-h-20 text-lg mt-2">
        <div class="flex">
          <span class="material-symbols-outlined">{{ alertType }}</span>
          <div class="ml-2" v-html="$props.instruction"></div>
        </div>
      </div>

      <div class="text-center mt-2 mb-2">
        <button @click="this.ok" class="bg-slate-200 shadow-md px-2 py-1 rounded-md font-bold">Ok</button>
      </div>
    </div>
  </div>
</template>