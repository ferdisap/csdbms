<script>
import TitleBar from '../gui/TitleBar.vue';
import ListTree from './sub/ListTree.vue';
import Tes from './sub/Tes.vue';
export default {
  components: { TitleBar, ListTree, Tes },
  props: {
    foo: {
      type: String,
      default: 'bar'
    }
  },
  mounted(){
    top.exp = this;
  }
}
</script>
<template>
  <div class="explorer h-full w-full border shadow-md">
    <TitleBar :title="$props.foo"/>
    <div class="flex h-[calc(100%-3rem)] space-x-5">
      <div>
        <ListTree/>
      </div>
      <div>
        content
      </div>
    </div>
  </div>
</template>