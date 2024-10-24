<script>
import { addSetLogic } from '../../../js/util/ObjectProperty';
import { isArray } from '../../../js/util/helper';

export default {
  props: {
    classLabel: {
      type: String,
      default: "text-lg font-bold"
    },
    class: { // not applicable
      type: String,
    },
    nameAttr: {
      type: String,
      default: 'remarks',
    },
    lineType: {
      type: String,
      default: '',
    },
    para: {
      // type: String,
      default: ''
    },
  },
  mounted() {
    addSetLogic(this._.props, 'para', function (ctx, v) {
      if(isArray(v)) v = v.join("\n");
      setTimeout(()=> this.$el.querySelector('text-editor').attachEditor(v));
      return v;
    }.bind(this))
  }
}
</script>

<template>
  <div class="remarks">
    <div :class="['block mb-2 text-gray-900 dark:text-white', $props.classLabel]">Remarks</div>
    <div :class="[$props.class, 'w-full block']">
      <text-editor id="id" :line-type="$props.lineType" :name="$props.nameAttr">{{ $props.para }}</text-editor>
    </div>
    <div class="error-form" v-html="$ersp.get('$props.nameAttr')"></div>
  </div>
</template>