<script>
import axios from 'axios';
import searchCsdbObject from '../../../md/searchCsdbObject.md?url'
import { markdown } from 'markdown';

export default {
  data() {
    return {
      sc: '',
    }
  },
  props: {
    path: {
      type: String,
      default: '',
    },
    status: {
      type: String
    }
  },
  emits: ['start', 'success'],
  methods: {
    info: function () {

      axios.get(window.origin + searchCsdbObject)
        .then((r) => {
          top.res = r;
          top.markdown = markdown;

          const e = new Event("new-window");
          e.data = {
            parent: {
              type: 'window',
              app: this.$el.closest(".app-window"),
            },
            alert: {
              props: {
                title: 'Search Csdb Info',
                type: 'note',
                instruction: markdown.toHTML(r.data)
              },
              style: {
                position: 'absolute',
                width: '400px',
                top: '25px',
                left: (((top.innerWidth / 2) - 200) + 'px'),
                backgroundColor: '#ffffff',
              }
            }
          }
          top.dispatchEvent(e);
        })
    },
    search: async function () {
      this.$emit('start');
      const response = await axios({
        url: "/api/s1000d/path/" + this.$props.path,
        method: 'GET',
        params: { sc: this.sc, stt: this.$props.status }
      });
      this.$emit('success', response)
    },
  },
}
</script>
<template>
  <div class="space-x-4 w-full flex">
    <input @change="search" v-model="this.sc" placeholder="find filename" type="text"
      class="w-full inline bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
    <button class="material-icons mx-3 text-gray-500 text-base has-tooltip-arrow inline" data-tooltip="info"
      @click="info">info</button>
  </div>
</template>