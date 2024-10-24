<script>
import { addSetLogic } from '../../../../js/util/ObjectProperty';
import Property from './Property.vue';
import Comment from '../sub/Comment.vue';
import axios from 'axios';

export default {
  components: { Comment, Property },
  data(){
    return {
      data: {
        nav: 'ident'
      },
    }
  },
  props:{
    filename: { type: String },
    path: { type: String },
    storage: { type: String },
  },
  methods: {
    requestData(navName){
      switch (navName) {
        case 'ident':
          if(!this.data.ident) axios.get("/api/s1000d/ident/" + this.$props.filename).then((response) => this.data.ident = response.data.csdb.ident);          
          break;
        case 'status': 
          if(!this.data.status) axios.get("/api/s1000d/status/" + this.$props.filename).then((response) => this.data.status = response.data.csdb.status);          
          break;
        case 'history': 
          if(!this.data.history) axios.get("/api/s1000d/histories/" + this.$props.filename).then((response) => this.data.history = response.data.csdb.histories);          
          break;
        // case 'comment': 
        //   if(!this.data.comment) axios.get("/api/s1000d/comments/" + this.$props.filename).then((response) => this.data.comment = response.data.csdb.comments);
        //   break;
      }
    },
  },
  mounted(){
    // top.pdo = this;
    addSetLogic(this.data,'nav', (ctx,v) => {
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
        <h1 class="text-center font-bold mb-2 text-lg">Details {{ $props.filename }}</h1>
        <div class="w-full text-center mb-2 relative">
          <div class="flex mb-2">
            <div class="material-symbols-outlined text-8xl">description</div>
            <div class="text-left p-1 w-full">
              <div class="mb-1">
                <span class="font-bold">filename: </span>
                <span>DMC...xml</span>
              </div>
              <div class="mb-1">
                <span class="font-bold">Path: </span>
                <span>CSDB</span>
              </div>
              <div class="mb-1">
                <span class="font-bold">Initiator: </span>
                <span>Luffy</span>
              </div>
            </div>
          </div>
          <div class="border-t">
            <nav class="flex w-min border-x">
              <button @click="data.nav = 'ident'" :class="[(data.nav === 'ident' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4 ']" type="button" >Ident</button>
              <button @click="data.nav = 'status'" :class="[(data.nav === 'status' ? 'bg-gray-100 border-b-none' : 'border-b'),'font-semibold py-2 px-4']" type="button" >Status</button>
              <button @click="data.nav = 'history'" :class="[(data.nav === 'history' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4']" type="button">History</button>
              <button @click="data.nav = 'comment'" :class="[(data.nav === 'comment' ? 'bg-gray-100 border-b-none' : 'border-b'), 'font-semibold py-2 px-4']" type="button">Comment</button>
            </nav>
            <div class="w-full min-h-28 p-2 text-left">
              <!-- ident -->
              <div v-show="data.nav === 'ident'">
                <div class="mb-1" v-if="data.ident" v-for="(value, key) in data.ident">
                  <span class="font-bold">{{ key }}: </span>
                  <span class="ml-2">{{ value }}</span>
                </div>
                <div v-else class="p-4 text-center text-gray-300">fetching...</div>
              </div>
              <!-- status -->
              <div v-show="data.nav === 'status'">
                <div class="mb-1" v-if="data.status" v-for="(value, key) in data.status">
                  <span class="font-bold">{{ key }}: </span>
                  <span class="ml-2">{{ value }}</span>
                </div>
                <div v-else class="p-4 text-center text-gray-300">fetching...</div>
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
                        <td class="border px-2">{{ i+1 }}</td>
                        <td class="border px-2 font-bold">{{ history[1] }}</td>
                        <td class="border px-2 ml-2">{{ history[2] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="p-4 text-center text-gray-300">fetching...</div>
              </div>
              <!-- comment -->
              <div v-show="data.nav === 'comment'">
                <Comment :filename="$props.filename" :path="$props.path" :storage="$props.storage"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Property>
</template>