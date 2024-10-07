<script>
export default {
  data(){
    return {
      state: false
    }
  },
  methods:{
    newExplorer(){
      this.$window.create({
        window: {name: 'Explorer'},
        task: {title: 'Explorer'},
      })
    },
    newHelloWorld(){
      this.$window.create({
        window: {name: 'HelloWorld', props:{foo:'bue'}},
        task: {title: 'Hello World'}
      })
    },
    newDML(){
      this.$window.create({
        window: {name: 'DML'},
        task: {title: 'DML'}
      })
    }
  },
  mounted(){
    document.addEventListener('start-menu',()=>{
      console.log('start-menu');
      this.state = !this.state;
    })
    document.addEventListener('click', () => {
      this.state = false;
    });

    // dummy
    setTimeout(()=>{
      this.newExplorer();
      this.newDML();
      this.newHelloWorld();
    },10)
  },
}
</script>
<template>
  <div v-show="state" class="w-48 h-96 top-[-24rem] text-black bg-neutral-200 absolute left-0 z-[90] p-2">
    <RouterLink @click="newHelloWorld()" :to="$router.resolve({name: 'HelloWorld'})['fullPath']"
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
    </RouterLink>
  </div>
</template>