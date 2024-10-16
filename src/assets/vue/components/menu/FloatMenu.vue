<script>
import Randomstring from 'randomstring';
import { addSetLogic } from '../../../js/util/ObjectProperty';

export default {
  data() {
    return {
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
      range: ''
    }
  },
  props: {
    level: {
      default: 0
    },
    trigger: Array,
    useCopyBtn: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    copy: function () {
      const textCopy = this.range.toString();
      if (textCopy) {
        navigator.clipboard.writeText(textCopy);
        const selection = window.getSelection();
        if (selection.rangeCount > 0) selection.removeAllRanges();
        selection.addRange(this.range);
      } else {
        const range = new Range();
        // Start range at second paragraph
        range.setStartBefore(top.FloatMenu.event.target);
        // End range at third paragraph
        range.setEndAfter(top.FloatMenu.event.target);
        // Add range to window selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) selection.removeAllRanges();
        selection.addRange(range);
        // tergantung window.isSecureContext. kalau php artisan serve, maka true, jika IIS false karena belum tau caranya
        navigator.clipboard.writeText(range.toString()); // output promise
      }
    }
  },
  mounted() {
    // top.mainApp.config.globalProperties.FloatMenu.register(this.componentId,this.trigger, parseInt(this.$props.level));
    top.FloatMenu.register(this.componentId, this.trigger, parseInt(this.$props.level));

    // jika ingin dinamic memunculkan tombol copy
    if(this.$props.useCopyBtn){
      this.$el.component = new WeakRef(this);
      addSetLogic(document.getElementById(this.componentId), 'copiable', (ctx, value) => {
        top.copyel = ctx;
        // ga bisa akses __vnode di production, jadi terpaksa pakai WeakRef
        // if(value && ctx) ctx.__vnode.ctx.data.range = window.getSelection().getRangeAt(0).cloneRange();
        // else setTimeout(() => ctx.__vnode.ctx.data.range =  '');
        if(value && ctx) ctx.closest(".floatmenu").component.deref().range = window.getSelection().getRangeAt(0).cloneRange();
        else setTimeout(() => ctx.closest(".floatmenu").component.deref().range =  '');
        return value;
      });
    }
  }
}
</script>
<template>
  <div :id="componentId" class="floatmenu">
    <div class="container">
      <slot>
      </slot>
      <hr v-if="$props.useCopyBtn">
      <div class="list copy" @click="copy" v-if="$props.useCopyBtn">
        <div>copy</div>
      </div>
    </div>
  </div>
</template>
