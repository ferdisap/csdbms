<script>
import axios from 'axios';
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import { addSetLogic } from '../../../js/util/ObjectProperty';
import { fileTypeFromBuffer } from 'file-type';
import { useCache } from '../../../js/plugin/sub/WindowCache';

export default {
  components: { ContinuousLoadingCircle, TitleBar },
  data() {
    return {
      file: undefined
    }
  },
  props: {
    filename: { type: String },
    access_key: { type: String }
  },
  methods: {
    upload(event) {
      const fd = new FormData(event.target);
      axios.post("/api/s1000d/icn/upload", fd)
        .then(rsp => {
          this._.props.filename = rsp.csdb.filename;
          this._.props.access_key = '';
        })
    },
    readEntity(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type === 'text/xml') {
          event.target.value = '';
          // const reader = new FileReader();
          // reader.onload = () => {
          // display alert that file is not ICN or open XML editor
          // this.$parent.readTextFileFromUploadICN(reader.result);
          // this.emitter.emit('readTextFileFromUploadICN'); // untuk mengoffkan preview dan lain2nya
          // }
          // reader.readAsText(file);
          const newWindowEvent = new Event('new-window');
          newWindowEvent.data = {
            parent: {
              type: 'window',
              app: this.$el.closest(".app-window"),
            },
            alert: {
              props: {
                type: 'caution',
                instruction: file.name + " is not type of ICN!",
              }
            }
          }
          top.dispatchEvent(newWindowEvent);
        }
        else {
          this.file = {
            mime: file.type,
            src: URL.createObjectURL(file),
          }
        }
      }
    },
    request(filename, access_key) {
      this.clp(true);
      axios({
        url: "/api/s1000d/csdb/read/" + filename + (access_key ? '?access_key=' + access_key : ''),
        method: 'GET',
        responseType: 'arraybuffer'
      })
        .then(async (rsp) => {
          const { mime } = (await fileTypeFromBuffer(rsp.data));
          const blob = new Blob([rsp.data], { type: mime });
          const url = URL.createObjectURL(blob);
          this.file = {
            src: url,
            mime: mime,
            access_key: '',
            name: filename
          }
        })
        .finally(()=>this.clp(false));
    },
  },
  beforeCreate() {
    useCache.apply(this);
  },
  mounted() {
    addSetLogic(this._.props, 'filename', (ctx, v) => {
      this.request(v)
      return v;
    });
    if(this.$props.filename) this.request(this.$props.filename);
    top.icn = this;
  }
}
</script>
<template>
  <div class="icn h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="Information Control Number" />
    <div class="h-[calc(100%-3rem)] w-full">
      <div v-if="!$props.filename" class="px-2 pt-5">
        <!-- fetching -->
        <form @submit.prevent="upload">
          <div>
            <label class="font-bold">Filename</label><br />
            <input type="text" name="filename" placeholder="type the ICN filename include extension"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          </div>
          <div class="error-form" v-html="$ersp.get('filename')"></div>
          <div class="w-1/3 inline-block">
            <label for="icn-path" class="font-bold">Browse</label><br />
            <input type="file" id="entity" name="entity" @change="readEntity($event)"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
          <div class="w-full text-center my-2 py-2">
            <button type="submit" name="button"
              class="button text-sm bg-blue-400 text-white hover:bg-blue-600">Upload</button>
          </div>
        </form>
      </div>
      <div v-if="file" class="p-4 w-full h-full">
        <h1 class="w-full mb-3 mt-2 font-bold text-lg h-12">{{ file.name }}</h1>
        <div class="flex justify-center h-[calc(100%-3.5rem)] w-full">
          <!-- <embed class="w-auto max-w-[100%] h-auto max-h-[100%] border-2 p-4" :src="file.src" :type="file.mime" /> -->
          <embed class="max-w-[100%] h-fit max-h-[100%] border-2 p-4" :src="file.src" :type="file.mime" />
        </div>
      </div>
      <ContinuousLoadingCircle/>
    </div>
  </div>
</template>