<script>
import TitleBar from '../../gui/TitleBar.vue';

// function run() {
//   let resolve = undefined;
//   let reject = undefined;

//   const promise = new Promise((r, j) => {
//     resolve = r;
//     reject = j;
//   })

//   const yes = () => resolve(1);
//   const no = () => reject(0);
//   const wait = () => promise;
//   return { yes, no, wait };
// }

const dialog = () => {
  let resolve = undefined;
  let reject = undefined;

  const promise = new Promise((r, j) => {
    resolve = r;
    reject = j;
  })

  const yes = () => resolve(true);
  const no = () => reject(false);
  const result = () => promise;
  return { yes, no, result };
}

export {dialog}

export default {
  components: { TitleBar },
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
  mounted() {
    top.dc = this;
  }
}
</script>
<template>
  <div class="h-full w-full border shadow-md">
    <TitleBar :sizing-button="false" :hide-button="false" :title="$props.title" />
    <div class="px-3 py-1">
      <div class="font-bold text-lg mt-2">{{ $props.instruction }}</div>
      <div class="mt-2 h-32">
        <slot name="content"></slot>
      </div>

      <div class="relative">
        <div v-if="$props.options" class="absolute left-0 space-x-1">
          <button class="material-symbols-outlined text-base">keyboard_arrow_down</button>
          <span>More options</span>
        </div>

        <div class="absolute space-x-2 right-2">
          <!-- <button @click="this.button(true, $event)" -->
          <button @click="this.yes"
            class="bg-slate-200 shadow-md px-2 py-1 rounded-md font-bold">Yes</button>
          <!-- <button @click="this.button(false, $event)" -->
          <button @click="this.no"
            class="bg-slate-200 shadow-md px-2 py-1 rounded-md font-bold">No</button>
        </div>
      </div>

      <div v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>