<script>
import axios from 'axios';
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import { addSetLogic } from '../../../js/util/ObjectProperty';
import { fileTypeFromBuffer } from 'file-type';
import { useCache } from '../../../js/plugin/sub/WindowCache';
import config from '../../../config.json'

/**
 * props: title:string, type:string, instruction:string
 */
function openAlertUpload(props) {
  const event = new Event("new-window");
  event.data = {
    parent: {
      type: 'window',
      app: this.$el.closest('.app-window'),
    },
    alert: {
      props,
    }
  }
  top.dispatchEvent(event);
}

export default {
  components: { ContinuousLoadingCircle, TitleBar },
  data() {
    return {
      progress: undefined,
      file: undefined
    }
  },
  props: {
    filename: { type: String },
    access_key: { type: String }
  },
  methods: {
    upload(event) {
      // const fd = new FormData(event.target);
      // axios.post("/api/s1000d/icn/upload", fd)
      //   .then(rsp => {
      //     this._.props.filename = rsp.csdb.filename;
      //     this._.props.access_key = '';
      //   })

      // chunk file
      const fd = new FormData(event.target);
      const entity = fd.get('entity')
      top.fd = fd;

      const CHUNK_SIZE = 1024 * 1000;
      let start = 0;
      let end = CHUNK_SIZE;

      let i = 1
      const length = Math.round(entity.size / CHUNK_SIZE);
      fd.set('total', length);

      const onSuccess = (rsp) => {
        this.progress = '100% Upload success';
        openAlertUpload.call(this, {
          title: 'Upload File ' + fd.get('filename'),
          type: 'note',
          instruction: 'Uploading ICN success.'
        })
        this._.props.access_key = rsp.data.csdb.access_key.key;
        this._.props.filename = rsp.data.csdb.filename;
      }

      const onFail = () => {
        openAlertUpload.call(this, {
          title: 'Upload File ' + fd.get('filename'),
          type: 'warning',
          instruction: 'Uploading ICN failed.'
        })
      }

      let req;

      const sent = async () => {
        if (start < entity.size && length >= i) {
          fd.set('entity', entity.slice(start, end))
          fd.set('part', i)

          req = axios.post("/api/s1000d/icn/upload", fd);
          req.then((rsp) => {
            this.progress = Math.floor((i / length) * 100) + ' %';

            start = end;
            end = start + CHUNK_SIZE;
            i++;

            sent();

            if (i - 1 >= length) {
              onSuccess(rsp);
              //   this.progress += ' Upload success';
              //   openAlertUpload.call(this, {
              //     title: 'Upload File ' + fd.get('filename'),
              //     type: 'note',
              //     instruction: 'Uploading ICN success.'
              //   })
              //   this._.props.access_key = rsp.data.csdb.access_key.key;
              //   this._.props.filename = rsp.data.csdb.filename;
            };
          })
          req.catch(onFail)
        } else {
          req = req = axios.post("/api/s1000d/icn/upload", fd);
          req.then(rsp => {
            onSuccess(rsp);
          })
          req.catch(onFail);
        }
      };
      sent();

    },
    readEntity(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type.includes('text')) {
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
    request(filename) {
      // this.file = {
      //   src: "https://ferdisap.github.io/3DViewer#https://ferdisap.github.io/3DViewer/assets/model/as1_pe_203.stp",
      //   mime: 'application/octet-stream',
      //   name: filename
      // }
      // return;
      this.clp(true);
      axios({
        url: "/api/s1000d/csdb/read/" + filename + (this.$props.access_key ? '?access_key=' + this.$props.access_key : ''),
        method: 'GET',
        responseType: 'arraybuffer'
      })
        .then(async (rsp) => {
          // top.rsp = rsp;
          // top.fileTypeFromBuffer = fileTypeFromBuffer
          // const { mime } = (await fileTypeFromBuffer(rsp.data));
          const mime = rsp.headers['content-type']
          const blob = new Blob([rsp.data], { type: mime });
          const url = URL.createObjectURL(blob);
          if (mime.includes('image') || mime.includes('video')) {
            this.file = {
              src: url,
              mime: mime,
              access_key: '',
              name: filename
            }
          } else {
            this.file = {
              src: "https://ferdisap.github.io/3DViewer#model=" + config.CSDB_HOST + "/api/s1000d/csdb/read/" + filename + (this.$props.access_key ? '?access_key=' + this.$props.access_key : ''),
              mime: mime,
              name: filename
            }
          }
        })
        .finally(() => this.clp(false));
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
    if (this.$props.filename) this.request(this.$props.filename);
    // top.icn = this;
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
            <span>{{ progress }}</span>
          </div>
        </form>
      </div>
      <div v-if="file" class="p-4 w-full h-full">
        <h1 class="w-full mb-3 mt-2 font-bold text-lg h-12">{{ file.name }}</h1>
        <div class="icn-container flex justify-center h-[calc(100%-3.5rem)] w-full">
          <embed v-if="file.mime.includes('image')" class="max-w-[100%] h-fit max-h-[100%] border-2 p-4" :src="file.src"
            :type="file.mime" />
          <video v-else-if="file.mime.includes('video')" class="max-w-[100%] h-fit max-h-[100%] border-2 p-4"
            :id="'videojs'" controls data-setup='{}'>
            <source :src="file.src" :type="file.mime" />
            <p class="vjs-no-js"> To view this video please enable JavaScript, and consider upgrading to a web browser
              that
              <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
            </p>
          </video>
          <iframe v-else :src="file.src" class="w-full h-full border-2 p-4"></iframe>
        </div>
      </div>
      <ContinuousLoadingCircle />
    </div>
  </div>
</template>