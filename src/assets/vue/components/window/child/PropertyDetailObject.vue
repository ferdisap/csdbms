<script>
import { addSetLogic } from '../../../../js/util/ObjectProperty';
import Property from './Property.vue';
import Comment from '../sub/Comment.vue';
import axios from 'axios';
import { openFile } from '../sub/Folder.vue';
import { auth } from '../../../../js/Auth';
import config from '../../../../config.json'

function style() {
  const t = ((top.innerHeight / 2) - 400);
  const l = ((top.innerWidth / 2) - 300);
  return {
    position: 'absolute',
    width: '600px',
    height: '800px',
    top: ((t > 0 ? t : 0) + 'px'),
    left: ((l > 0 ? l : 0) + 'px'),
    backgroundColor: '#ffffff',
  }
}
export { style }

export default {
  components: { Comment, Property },
  data() {
    return {
      data: {
        nav: 'ident'
      },
      fetching: 'fetching...'
    }
  },
  props: {
    filename: { type: String },
    path: { type: String },
    access_key: { type: String },
    route: { type: Object, default: {} },
  },
  methods: {
    requestData(navName) {
      // const url = new URL(config.CSDB_HOST + "/api/s1000d/ident/" + this.$props.filename);
      // if(this.$props.access_key) url.searchParams.set('access_key', this.$props.access_key);
      // if(auth().user.accessKey) url.searchParams.set('user_access_key', auth().user.accessKey.key);
      let url = "/api/s1000d/ident/" + this.$props.filename;
      if(this.$props.access_key) url += '?access_key=' + this.$props.access_key; 
      else if(auth().user.accessKey) url += '?user_access_key=' + auth().user.accessKey.key; 

      switch (navName) {
        case 'ident':
          if (!this.data.ident) axios({
            url: url, method: 'GET', params: this.$props.route.params
          }).then((response) => {
            if (response.status === 204) {
              this.fetching = 'Not available.'
              return;
            };
            this.data.ident = response.data.csdb.ident;
            this.data.owner = response.data.csdb.owner;
            this.data.initiator = response.data.csdb.initiator;
          });
          break;
        case 'status':
          if (!this.data.status) axios({
            url: "/api/s1000d/status/" + this.$props.filename + '?access_key=' + this.$props.access_key, method: 'GET', params: this.$props.route.params
          }).then((response) => {
            if (response.status === 204) {
              this.fetching = 'Not available.'
              return;
            };
            this.data.status = response.data.csdb.status
          });
          break;
        case 'history':
          if (!this.data.history) axios({
            url: "/api/s1000d/histories/" + this.$props.filename + '?access_key=' + this.$props.access_key, method: 'GET', params: this.$props.route.params
          }).then((response) => {
            if (response.status === 204) {
              this.fetching = 'Not available.'
              return;
            };
            this.data.history = response.data.csdb.histories;
          });
          break;
        // case 'comment': 
        //   if(!this.data.comment) axios({
        //     url: "/api/s1000d/comments/" + this.$props.filename, method: 'GET', params: this.$props.route.params
        //}).then((response) => this.data.comment = response.data.csdb.comments);
        //   break;
      }
    },
    openInApp() {
      openFile(this._.props)
    },
    openInXml() {
      openFile(this._.props, 'XMLEditor')
    },
    openInPdf() {
      openFile(this._.props, 'PDFViewer')
    },
  },
  mounted() {
    // top.pdo = this;
    addSetLogic(this.data, 'nav', (ctx, v) => {
      this.requestData(v);
      return v;
    });
    this.requestData(this.data.nav)
  }
}
</script>

<template>
  <Property :use-button="false" title="Detail Csdb">
    <template #content>
      <div class="border p-2">
        <h1 class="text-center font-bold mb-2 text-lg">{{ $props.filename }}</h1>
        <div class="w-full text-center mb-2 relative">
          <div class="flex mb-2 ">
            <div class="material-symbols-outlined text-8xl">description</div>
            <div class="text-left p-1 w-full">
              <div class="mb-1">
                <span class="font-bold">filename: </span>
                <span>{{ $props.filename }}</span>
              </div>
              <div class="mb-1">
                <span class="font-bold">Path: </span>
                <span>{{ $props.path }}</span>
              </div>
              <div class="mb-1" v-if="this.data.initiator">
                <span class="font-bold">Initiator: </span>
                <span>{{ this.data.initiator.email }}</span>
              </div>
              <div class="mb-1" v-if="this.data.owner">
                <span class="font-bold">Owner: </span>
                <span>{{ this.data.owner.email }}</span>
              </div>
            </div>
          </div>
          <div class="my-2">
            open in: <a href="#" @click="openInApp">App</a>, <a href="#" @click="openInPdf">Pdf</a>, <a href="#"
              @click="openInXml">Xml</a>
          </div>
          <div class="border-t">
            <nav class="flex w-min border-x">
              <button @click="data.nav = 'ident'"
                :class="[(data.nav === 'ident' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4 ']"
                type="button">Ident</button>
              <button @click="data.nav = 'status'"
                :class="[(data.nav === 'status' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4']"
                type="button">Status</button>
              <button @click="data.nav = 'history'"
                :class="[(data.nav === 'history' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4']"
                type="button">History</button>
              <button @click="data.nav = 'comment'"
                :class="[(data.nav === 'comment' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4']"
                type="button">Comment</button>
            </nav>
            <div class="w-full min-h-28 p-2 text-left">
              <!-- ident -->
              <div v-show="data.nav === 'ident'">
                <div class="mb-1" v-if="data.ident" v-for="(value, key) in data.ident">
                  <span class="font-bold">{{ key }}: </span>
                  <span class="ml-2">{{ value }}</span>
                </div>
                <div v-else class="p-4 text-center text-gray-300">{{ fetching }}</div>
              </div>
              <!-- status -->
              <div v-show="data.nav === 'status'">
                <div class="mb-1" v-if="data.status" v-for="(value, key) in data.status">
                  <span class="font-bold">{{ key }}: </span>
                  <span class="ml-2">{{ value }}</span>
                </div>
                <div v-else class="p-4 text-center text-gray-300">{{ fetching }}</div>
              </div>
              <!-- history -->
              <div v-show="data.nav === 'history'">
                <div class="mb-1" v-if="data.history">
                  <table class="border">
                    <thead>
                      <tr>
                        <th class="border px-2 w-10">No</th>
                        <th class="border px-2">Code</th>
                        <th class="border px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(history, i) in data.history" :data-id="history[0]">
                        <td class="border px-2">{{ i + 1 }}</td>
                        <td class="border px-2 font-bold">{{ history[1] }}</td>
                        <td class="border px-2 ml-2">{{ history[2] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="p-4 text-center text-gray-300">{{ fetching }}</div>
              </div>
              <!-- comment -->
              <div v-show="data.nav === 'comment'">
                <Comment :filename="$props.filename" :path="$props.path" :access_key="$props.access_key" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Property>
</template>