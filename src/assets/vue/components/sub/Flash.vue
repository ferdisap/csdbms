<script>
export default {
  data() {
    return {
      bag: [],
    }
  },
  methods: {
    replaceFilenameWithURL(text) {
      try {
        // let forObject = this.techpubStore.getWebRoute('', { filename: '$1' }, Object.assign({}, this.$router.getRoutes().find(r => r.name == 'DetailObject')))['path'];
        // text = text.replace(/([\S]+.xml)(\s|$|\.)/g, `<a class="font-bold" href="${forObject}">$1$2</a>`);
        return text;
      } catch (error) {
        // console.log(error)
        return text;
      }
    },
    addBag(data = {}) {
      if (data.message) {
        this.bag.push(data);
        setTimeout(() => this.popBag(data), 10000);
        // if (!(this.bag.find((b) => b.message == data.message))) {}
      }
    },
    popBag(value) {
      let index = this.bag.indexOf(value);
      this.bag.splice(index,1);
    },
    getBgBasedOnInfoType(data){
      return data.type === 'warning' ? 'bg-red-600' : 
        data.type === 'caution' ? 'bg-yellow-400' : (
          data.type === 'note' ? 'bg-cyan-500' : (
            'bg-red-500'
          )
        );
    }
  },
  mounted() {
    document.addEventListener('flash', (e) => this.addBag(e.data));
  },
}
</script>

<template>
  <div class="fixed w-1/2 top-1/5 right-0 z-[100]" v-if="bag.length">
    <div v-for="info in bag" :class="[getBgBasedOnInfoType(info), 'mb-3 opacity-90 font-semibold pb-3 px-5 shadow-lg rounded-lg block text-left w-full']">
      <div class="text-center text-xl p-3 font-bold border-b-2 mb-2">Message
        <span class="float-right has-tooltip-arrow" data-tooltip="Close"><button class="hover:scale-150"
            @click="popBag(info)" info-close-btn>X</button></span>
      </div>
      <div v-if="info.errors" class="mt-3">
        <div class="mb-2 flex space-x-2" v-for="(messages, key) in info.errors">
          <div class="pr-2 border-r-2">{{ key }}</div>
          <div>
            <p style="line-break: anywhere" v-for="text in messages" v-html="text.toString()" />
          </div>
        </div>
      </div>      
      <div v-else v-html="replaceFilenameWithURL(info.message)" class="mb-1"></div>
    </div>
  </div>
</template>

<!-- <p style="line-break: anywhere" v-for="text in messages" v-html="text.toString().replace(/([\S]+.xml)(\s|$|\.)/g, `<a href='/csdb/$1'>$1$2<a/>`)" /> -->