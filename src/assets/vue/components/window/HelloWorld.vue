<script>
import Randomstring from 'randomstring';
import TitleBar from '../gui/TitleBar.vue';
import Tes from './sub/Tes.vue';
export default {
  name: 'HW',
  data() {
    return {
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
      title: 'Hello World',
    }
  },
  components:{TitleBar, Tes},
  methods:{
    async openDialog(){
      const evt = new Event('new-window');
      evt.data = {
        config: {
          dialog: {}
        }
      }
      this.$el.dispatchEvent(evt);
      this.$el.closest('.app-window').dialog.result()
      .then(r => {
        console.log(r);
        // continue process (r is boolean true)
      })
      .catch(r => {
        console.log(r);
        // continue process (r is boolean false)
      });
    }
  },
  props:{
    foo:{
      type:String,
      default: 'bar'
    }
  },
  mounted() {
    window.helloworld = this;
    // if(localStorage.getItem(this._.uid)){
    //   this._.props.foo = JSON.parse(localStorage.getItem(this._.uid)).props.foo;
    // }
    // const e = new Event('new-task');
    // e.data = { id: this.componentId, title: 'Hello World'};
    // document.dispatchEvent(e);
    // this.$window.register(this);
    // window.hwel = this.$el;
  }
}
</script>

<template>
  <div class="helloworld h-full w-full border shadow-md overflow-auto">
    <TitleBar />
    <div class="mt-5 px-3 py-5">
      <h1 class="text-center underline text-5xl font-bold tracking-widest text-blue-500">Hello World {{ $props.foo }}</h1>
      <p class="mt-2">Welcome to the CSDB Management System. In this application, you are enable to create, manage, publish
        your technical pubication. This Application comply to the S1000D international standard to build Technical Manuals.
      </p>
      <p>
        <button @click.stop="openDialog">Open Dialog Box</button>
      </p>
      <Tes :text="$props.foo"/>
      <Tes :text="$props.foo"/>
    </div>
  </div>
</template>

