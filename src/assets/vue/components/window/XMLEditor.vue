<script>
import { EditorView, gutter, lineNumbers, GutterMarker, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import Randomstring from 'randomstring';
import { ref } from 'vue';
import TitleBar from '../gui/TitleBar.vue';
import axios from 'axios';
import { formDataToObject } from "../../../js/util/helper";
import ContinuousLoadingCircle from "../sub/ContinuousLoadingCircle.vue";

/**
 * cara pakai:
 * 1. instance class
 * 2. setRoute(techpubRoute)
 * 3. run attachEditor(),
 * 3. fetchRaw() or changeText()
*/
class XMLEditor {

  id = '';
  editor = undefined;

  constructor(id = '') {
    if (!id) id = Randomstring.generate({ charset: 'alphabetic' });
    this.id = id;
  }

  /**
   * pakai fungsi anonymouse agar thisnya merujuk ke proxy yang dibuat constructor
   */
  attachEditor = () => {
    this.editor = new EditorView({
      doc: '',
      extensions: [keymap.of(defaultKeymap), EditorView.lineWrapping, lineNumbers(), gutter({ class: "cm-mygutter" })],
      parent: document.querySelector('#' + this.id),
    });
  }

  fetchRaw = (filename) => {
    this.changeText(' ON LOADING...');

    axios({
      url: "/api/s1000d/csdb/read/" + filename,
      method: 'GET',
    })
      .then(response => {
        if ((response.statusText === 'OK' || ((response.status >= 200) && (response.status < 300))) && !this.stop) this.changeText(response.data);
      })
      .catch(() => {
        this.changeText(" CANNOT FETCH XML. ");
      })
  }

  changeText = (text = undefined, from = 0, to = 0) => {
    if (text === undefined || text === null) {
      this.fetchRaw();
    }
    else {
      to = this.getTextLength();
      this.editor.dispatch({ changes: { from: from, to: to, insert: text } });
    }
  }

  getTextLength = () => {
    return this.editor.state.doc.toString().length;
  }

  get text(){
    return this.editor.state.doc.toString();
  }
}

// ###############

export default {
  data() {
    return {
      inputPath: ref(null),
      editor: new XMLEditor(),
    }
  },
  components:{ ContinuousLoadingCircle, TitleBar },
  props: {
    filename: {
      type: String
    },
    path: {
      type: String
    },
  },
  methods:{
    // jika PUT method, maka masih belum tau caranya membaca data di laravel kalau request pakai formdata, 
    //jadi saat ini masih di convert form data nnya ke json
    submit(event){
      event.preventDefault();
      const fd = new FormData(event.target);
      fd.set('xmleditor', this.editor.text);
      if(this.$props.filename) {
        this.clp(true);
        axios.post("/api/s1000d/csdb/update/" + this.$props.filename, fd)
        .finally(()=>this.clp(false))
      }
      else {
        this.clp(true);
        axios.put("/api/s1000d/csdb/create", formDataToObject(fd))
        .finally(()=>this.clp(false))
      }
    }
  },
  mounted() {
    this.editor.attachEditor();
    if(this.$props.filename) this.editor.fetchRaw(this.$props.filename);
  },
}
</script>
<style>
.cm-editor{
  background: white;
  height: 100%;
}
</style>
<template>
  <div class="xmleditor h-full w-full border shadow-md">
    <TitleBar :title="'XMLEditor ' + $props.filename"/>
    <div class="h-[calc(100%-3rem)] w-full">
      <form @submit.stop.prevent="submit($event)" class="h-full">
        <input v-show="$props.filename" name="filename" type="text" class="hidden" :value="$props.filename" />
        <div class="h-[calc(100%-2.5rem)]">
          <div class="mb-1 h-8 px-2 py-1">
            <label for="object-path" class="text-sm font-bold mr-2">Path:</label>
            <input id="object-path" name="path" :value="$props.path" placeholder="type the fullpath eg. CSDB/N219/AMM"
              type="text"
              class="py-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          </div>
          <div :id="editor.id" class="h-[calc(100%-4rem)] text-xl mb-1"></div>
          <div class="error-form px-1" v-html="$ersp.get('xmleditor')"></div>
        </div>
        <div class="h-10">
          <button type="submit" name="button"
            :class="['button text-white text-sm', !$props.filename ? 'bg-green-400 hover:bg-green-600' : 'bg-violet-400 hover:bg-violet-600']">
            {{ !$props.filename ? 'Create' : 'Update' }}</button>
        </div>
      </form>
    </div>

    <ContinuousLoadingCircle/>
  </div>
</template>