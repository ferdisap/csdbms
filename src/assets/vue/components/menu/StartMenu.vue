<script>
export default {
  data(){
    return {
      state: false
    }
  },
  methods:{
    newExplorer(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'Explorer'},
        task: {
          props: {title: 'Explorer'}
        },
      })
    },
    newXMLEditor(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'XMLEditor'},
        task: {
          props: {title: 'XMLEditor'}
        },
      })
    },
    newHelloWorld(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'HelloWorld', props:{foo:'bue'}},
        task: {
          props: {title: 'Hello World'
        }}
      })
    },
    newDML(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'DML'},
        task: {
          props: {title: 'DML'
        }}
      })
    },
    newTrash(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'Trash'},
        task: {
          props: {title: 'Trash'
        }}
      })
    },
    newICN(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'ICN'},
        task: {
          props: {title: 'ICN'
        }}
      })
    },
    newImageMapper(event){
      event.preventDefault();
      this.$window.create({
        parent: {type: 'window', name: 'ImageMapper'},
        task: {
          props: {title: 'Image Mapper'
        }}
      })
    },
  },
  mounted(){
    document.addEventListener('start-menu',()=>{
      this.state = !this.state;
    })
    document.addEventListener('click', () => {
      this.state = false;
    });

    // dummy
    // setTimeout(async ()=>{
      // 
      // this.$window.create({
      //   dialog:{
      //     props:{
      //       title: 'Recent Windows',
      //       instruction: "Do you want to open previous windows?"
      //     }
      //   }
      // });
    // },10)

    // top.sm = this;
  },
}
</script>
<template>
  <!-- <div v-show="state" class="w-48 h-96 top-[-24rem] text-black bg-neutral-200 absolute left-0 z-[200] p-2"> -->
  <div v-show="state" class="fixed bottom-[calc(3.5%)] left-0 w-48 h-96 text-black bg-neutral-200 p-2">
    <a href="#" @click="newExplorer"
      class="border-b mt-2 border-slate-600 flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <i class="material-symbols-outlined">explore</i>
      <span class="font-semibold">Explore</span>
    </a>
    <a href="#" @click="newXMLEditor"
      class="border-b mt-2 border-slate-600 flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <i class="material-symbols-outlined">border_color</i>
      <span class="font-semibold">XML Editor</span>
    </a>
    <a href="#" @click="newTrash"
      class="border-b mt-2 border-slate-600 flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <i class="material-symbols-outlined">delete</i>
      <span class="font-semibold">Trash</span>
    </a>
    <a href="#" @click="newDML"
      class="border-b mt-2 border-slate-600 flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <i class="material-symbols-outlined">lan</i>
      <span class="font-semibold">Data Management List</span>
    </a>
    <a href="#" @click="newICN"
      class="border-b mt-2 border-slate-600 flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <i class="material-symbols-outlined">movie</i>
      <span class="font-semibold">Information Control Number</span>
    </a>
    <a href="#" @click="newImageMapper"
      class="border-b mt-2 border-slate-600 flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <i class="material-symbols-outlined">image</i>
      <span class="font-semibold">Image Mapper</span>
    </a>
    <!-- <RouterLink @click="newHelloWorld()" :to="$router.resolve({name: 'HelloWorld'})['fullPath']"
      class="flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <span class="material-symbols-outlined">explore</span>
      <span class="font-semibold">Hello World</span>
    </RouterLink>
    <RouterLink @click="newExplorer()" :to="$router.resolve({name: 'Explorer'})['fullPath']"
      class="flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <span class="material-symbols-outlined">explore</span>
      <span class="font-semibold">Explorer</span>
    </RouterLink>
    <RouterLink @click="newDML()" :to="$router.resolve({name: 'DML'})['fullPath']"
      class="flex items-center text-base space-x-1 hover:bg-neutral-100 py-1 px-1">
      <span class="material-symbols-outlined">explore</span>
      <span class="font-semibold">DML</span>
    </RouterLink> -->
  </div>
</template>