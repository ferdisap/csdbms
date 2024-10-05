<script>
import Randomstring from 'randomstring';
import TitleBar from '../gui/TitleBar.vue';
export default {
  data() {
    return {
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
      title: 'Hello World',
    }
  },
  components:{TitleBar},
  methods:{
    openDialog(e){
      const evt = new Event('new-window');
      evt.data = {
        config: {
          dialog: {
            tes: 'aaa'
          }
        }
      }
      e.target.dispatchEvent(evt);
      // top.dispatchEvent(evt);
    }
  },
  mounted() {
    // const e = new Event('new-task');
    // e.data = { id: this.componentId, title: 'Hello World'};
    // document.dispatchEvent(e);
    // this.$window.register(this);
    // window.helloworld = this;
  }
}
</script>

<template>
  <div class="helloworld h-full w-full border shadow-md">
    <TitleBar />
    <div class="mt-5 px-3 py-5">
      <h1 class="text-center underline text-5xl font-bold tracking-widest text-blue-500">Hello World</h1>
      <p class="mt-2">Welcome to the CSDB Management System. In this application, you are enable to create, manage, publish
        your technical pubication. This Application comply to the S1000D international standard to build Technical Manuals.
      </p>
      <p>
        <button @click.stop="openDialog">Open Dialog Box</button>
      </p>
    </div>
  </div>
</template>

