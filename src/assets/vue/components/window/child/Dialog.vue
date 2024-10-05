<script>
import TitleBar from '../../gui/TitleBar.vue';
export default {
  data(){
    return {}
  },
  components:{ TitleBar },
  props: {
    title: {
      type: String,
      default: 'Dialog Window'
    },
    instruction: {
      type: String,
      default: ''
    },
  }
}
</script>
<template>
  <!-- <div class="dump_red">ini dialog window {{ $props.tes }} </div> -->
  <div class="h-full w-full border shadow-md">
    <TitleBar :sizing-button="false" :hide-button="false" :title="$props.title"/>
    <div class="px-3 py-1">
      <div class="font-bold text-lg mt-2">{{ $props.instruction }}</div>
      <div class="mt-2">
        <slot name="content"></slot>
      </div>
      <div class="flex justify-between items-center">
        <div class="inline">
          <button>OK</button>
          <button>NOT OK</button>
        </div>
      </div>
  
      <div v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>