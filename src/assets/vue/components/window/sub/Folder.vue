<script>
import { installCheckbox, cancel, select } from '../../../../js/gui/Checkbox';
import Sort from '../../gui/Sort.vue';
import ContinuousLoadingCircle from "../../sub/ContinuousLoadingCircle.vue";
import FloatMenu from '../../menu/FloatMenu.vue';
import axios from "axios";
import Randomstring from 'randomstring';
import SearchCsdb from '../../sub/SearchCsdb.vue';
import { addSetLogic } from '../../../../js/util/ObjectProperty';
import { isNumber, indexFromParent } from '../../../../js/util/helper.js';
import { style as pdoStyle } from '../child/PropertyDetailObject.vue';
import { style as pdtStyle } from '../child/PropertyDispatchTo.vue';
import { useCache } from '../../../../js/plugin/sub/WindowCache';

function openDetailObjectPropertyWindow(windowEl, filename, path, access_key, route = {}) {
  const event = new Event("new-window");
  const style = pdoStyle();
  style.height = 'auto';
  event.data = {
    parent: {
      type: 'window',
      app: windowEl,
    },
    property: {
      name: 'PropertyDetailObject',
      props: {
        filename: filename,
        path: path,
        access_key: access_key,
        route,
      },
      style: style
    }
  }
  top.dispatchEvent(event);
}

export { openDetailObjectPropertyWindow }

function openDispatchToPropertyWindow(windowEl) {
  const event = new Event("new-window");
  event.data = {
    parent: {
      type: 'window',
      app: windowEl,
    },
    property: {
      name: 'PropertyDispatchTo',
      style: pdtStyle()
    }
  }
  top.dispatchEvent(event);
}

// digunakan di Folder.vue dan DDN.vue
// function openFile(filename){
/**
 * minimal ada filename
 */
function openFile(props = {},name){
  if(!name){
    name = props.filename.substring(0,3);
    if(!(name === ('DML') || name === 'DDN' || name === 'ICN' || name === 'IMF')) {
      // nama component/window sama, yaitu 'DML'||'DDN',
      // jika DMC,MC,COM,, dll akan terbuka menggunakan editor XML
      name = 'XMLEditor';
    }
  }
  const event = new Event("new-window");
  event.data = {
    parent: {
      type: 'window',
      name: name,
      props,
      style: {
        position: 'absolute',
        width: '600px',
        height: '600px',
        top: (((top.innerHeight / 2) - 400) + 'px'),
        left: (((top.innerWidth / 2) - 300) + 'px'),
        backgroundColor: '#ffffff',
      }
    },
    task:{
      props:{
        title: name
      }
    }
  }
  top.dispatchEvent(event);
}

export {openFile}

export default {
  components: { FloatMenu, Sort, ContinuousLoadingCircle, SearchCsdb },
  data() {
    return {
      data: {},
      open: {},
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
      selectionMode: false,
      validateMenuTriggerId: Randomstring.generate({ charset: 'alphabetic' }),
    }
  },
  props: {
    path: {
      type: String,
      default: 'csdb'
    },
    access_key:{
      type: String,
    },
    status: {
      type: String
    },
  },
  computed: {
    pagination() {
      return this.data.paginationInfo;
    },
    pageless() {
      return this.data.paginationInfo['prev_page_url'];
    },
    pagemore() {
      return this.data.paginationInfo['next_page_url'];
    },
  },
  methods: {
    getObjs: function (path, data = {}) {
      this.clp(true);
      if(this.$props.status) data.stt = this.$props.status; // sepertinya tidak perlu agar folder akan request semua file sesuai pathnya
      axios({
        url: "/api/s1000d/path/" + path,
        method: 'GET',
        params: data
      })
        .then(response => this.storingResponse(response))
        .finally(() => {
          installCheckbox(this.$el.querySelector(".cb-home"))
        })
    },
    storingResponse: function (response) {
      if (response.statusText === 'OK' || ((response.status >= 200) && (response.status < 300))) {
        this.data.csdbs = response.data.pagination.data; // array contain object csdb
        this.data.folders = response.data.paths; // array contain string path
        this.data.paginationInfo = response.data.pagination;
      }
      this.clp(false);
    },
    goto: async function (url, page) {
      if (page) {
        url = new URL(this.pagination['path']);
        url.searchParams.set('page', page)
      }
      if (url) {
        this.storingResponse(await axios.get(url));
      }
    },
    back: async function () {
      this._.props.path = this.$props.path.replace(/\/\w+\/?$/, "");
    },
    clickFolder: function (path) {
      this._.props.path = path
    },
    clickFilename: async function (filename, path, access_key) {
      openDetailObjectPropertyWindow(this.$el.parentElement.closest(".app-window"), filename, path, access_key);
    },
    edit() {
      // get filename
      const cbHome = this.$el.querySelector(".cb-home");
      let filename = cbHome.cbValues;
      if (!filename.length) {
        if (cbHome.current.cbWindow) {
          filename = [cbHome.current.cbWindow.cbValue]
        }
        else return;
      }

      filename.forEach(f => {
        const event = new Event("new-window");
        event.data = {
          parent: {
            type: 'window',
            name: 'XMLEditor',
            props: {
              filename: f,
              path: this.$props.path
            }
          },
          task: {
            props: {
              title: 'XMLEditor'
            }
          }
        }
        top.dispatchEvent(event);
      })
    },
    openTr() {
      const cbHome = this.$el.querySelector('.cb-home');
      if (cbHome.current && cbHome.current.matches(".file-row")) {
        const cbWindow = cbHome.current.cbWindow;
        top.cbWindow = cbWindow;
        openFile({filename: cbWindow.cbValue, access_key:cbWindow.data('access_key')})
      }
      else this.clickFolder(cbHome.current.cbWindow.cbValue);
    },
    sortTable: function sortTable(event) {
      const getCellValue = function (row, index) {
        const td = row.querySelectorAll('td')[index];
        return td ? td.textContent : '';
      };
      const comparer = function (index) {
        return function (a, b) {
          let valA = getCellValue(a, index), valB = getCellValue(b, index);
          return isNumber(valA) && isNumber(valB) ? valA - valB : valA.toString().localeCompare(valB);
        }
      };
      let table = event.target.closest('.cb-home');
      const index = indexFromParent(event.target.closest('th'));
      if (index === 0) {
        let filerows = [...table.querySelectorAll('.file-row')].sort(comparer(index));
        let folderrows = [...table.querySelectorAll('.folder-row')].sort(comparer(index));
        this.asc = !this.asc;
        if (!this.asc) {
          filerows = filerows.reverse();
          folderrows = folderrows.reverse();
        }
        for (let i = 0; i < folderrows.length; i++) {
          table.appendChild(folderrows[i]);
        }
        for (let i = 0; i < filerows.length; i++) {
          table.appendChild(filerows[i]);
        }
      } else {
        let filerows = [...table.querySelectorAll('.file-row')].sort(comparer(index));
        this.asc = !this.asc;
        if (!this.asc) {
          filerows = filerows.reverse();
        }
        for (let i = 0; i < filerows.length; i++) {
          table.appendChild(filerows[i]);
        }
      }
    },
    removeList: function (filename) {
      const csdb = this.data.csdbs.find((obj) => obj.filename === filename);
      const index = this.data.csdbs.indexOf(csdb);
      this.data.csdbs.splice(index, 1);
      return csdb;
    },
    dispatch: async function () {
      openDispatchToPropertyWindow(this.$el.closest(".app-window"));
      const cbHome = this.$el.querySelector(".cb-home");
      let filenames = cbHome.cbValues;
      if (!filenames.length) filenames = [cbHome.current.cbWindow.cbValue];
      this.$el.closest(".app-window").property.data = filenames;
    },
    changePath: function () {
      alert("change path")
    },
    deleteObject: async function () {
      // get filename
      const cbHome = this.$el.querySelector(".cb-home");
      let filename = cbHome.cbValues;
      if (!filename.length) {
        if (cbHome.current.cbWindow) {
          filename = [cbHome.current.cbWindow.cbValue]
        }
        else return;
      }

      // display dialog
      const e = new Event("new-window");
      const f = Object.assign([], filename);
      f.forEach(function (part, index) {
        this[index] = `<code class="filename">${part}</code>`
      }, f);
      const windowEl = this.$el.closest(".app-window");
      e.data = {
        parent: {
          type:'window',
          app: windowEl
        },
        dialog: {
          props: {
            title: 'Delete CSDB Object',
            instruction: `
            <h1>Are you sure want to delete ${filename.length}ea csdb object?</h1>
            <br>
            <div>
              ${f.join("")}
            </div>
            `
          }
        }
      }
      // top.edel = e;
      top.dispatchEvent(e);
      const result = await windowEl.dialog.result()
      if (!result) return;

      // fetch
      axios({
        url: "/api/s1000d/csdb/delete",
        method: 'DELETE',
        // data: { filename: this.$el.querySelector(".cb-home").cbValues },
        data: { filename: filename },
      })
        .then(response => {
          response.data.data.success.forEach((filename) => this.removeList(filename));
        })
        .finally(this.cancel)
    },
    restore: async function () {
      // get filename
      const cbHome = this.$el.querySelector(".cb-home");
      let filename = cbHome.cbValues;
      if (!filename.length) {
        if (cbHome.current.cbWindow) {
          filename = [cbHome.current.cbWindow.cbValue]
        }
        else return;
      }
      // fetch
      axios({
        url: "/api/s1000d/csdb/restore",
        method: 'POST',
        data: { filename: filename },
      })
        .then(response => {
          response.data.data.success.forEach((filename) => this.removeList(filename));
        })
        .finally(this.cancel)
    },
    download: async function (filenames) {
      alert("download")
      // let response = await axios({
      //   route: {
      //     name: 'api.download_objects',
      //     data: { filename: filenames },
      //   }, useComponentLoadingProgress: this.componentId,
      //   responseType: 'blob',
      // });
      // if (response.statusText === 'OK' || ((response.status >= 200) && (response.status < 300))) {
      //   const contentDisposition = response.headers.get('content-disposition');
      //   if (contentDisposition.substr(0, 10) === 'attachment') {
      //     let i;
      //     if ((i = contentDisposition.indexOf('filename')) > -1) {
      //       fileDownload(
      //         response.data,
      //         contentDisposition.replace(/.+filename="?(\S+[^"])/g, (m, p1) => p1)
      //       ); // jika ada banyak maka nanti otomatis ke downloa, misal dari server contentype nya zip ya otomatis downoad zip file
      //     } else {
      //       const url = URL.createObjectURL(await response.data); // asumsikan content-type = text/xml
      //       const a = document.createElement('a');
      //       a.target = '_blank';
      //       a.href = url
      //       a.click();
      //       URL.revokeObjectURL(url); // memory management
      //     }
      //   }
      //   this.CB.cancel();
      // }
    },
    validate: async function (type) {
      const cbHome = this.$el.querySelector(".cb-home");
      let filename = cbHome.cbValues;
      if (!filename.length) {
        if (cbHome.current.cbWindow) filename = cbHome.current.cbWindow.cbValue;
        else return;
      }
      switch (type) {
        case 'brex': axios.get("/api/s1000d/csdb/validatebrex?filename=" + filename.toString()); break;
        case 'xsi': axios.get("/api/s1000d/csdb/validatexsi?filename=" + filename.toString()); break;
      }
    },
    // checkbox
    select: select,
    cancel: cancel,
    onSearchSuccess: function (response) {
      this.storingResponse(response);
      installCheckbox(this.$el.querySelector(".cb-home"));
      this.clp(false);
    },
  },
  beforeCreate(){
    useCache.apply(this);
  },
  mounted() {
    addSetLogic(this.$el.querySelector(".cb-home"), 'sm', (ctx, value) => {
      this.selectionMode = value;
      return value;
    });
    addSetLogic(this._.props,'path', (ctx, v) => {
      if(v) this.getObjs(v);
      return v;
    })
    if(!this.$props.path) this._.props.path = this.$props.status === 'act' ? 'CSDB' : 'DELETED';
    this.getObjs(this.$props.path);
    top.folder = this;    
  },
}
</script>
<style>
.folder th,
.folder td {
  white-space: nowrap;
}
</style>
<template>
  <div :id="componentId" class="folder h-full w-full shadow-md p-2">
    <div class="h-[100%] w-full relative overflow-x-auto">

      <div class="h-[50px] mb-3 flex items-center space-x-4">
        <button @click="back" class="material-symbols-outlined tp-right-2 font-bold hover:bg-gray-100 block"
          data-tooltip="back">keyboard_backspace</button>
        <h1 class="text-2xl inline w-full"><span>#/</span>{{ this.$props.path.toUpperCase() }}</h1>
        <SearchCsdb :path="$props.path" @start="() => clp(true)" @success="onSearchSuccess" />
      </div>

      <div class="h-[calc(100%-90px)] overflow-y-auto">
        <table class="cb-home w-full">
          <thead class="text-base text-left border-b-2 h-10">
            <tr class="leading-3 text-base cb-room">
              <th style="display:none" class="cb-window-all"><input type="checkbox"></th>
              <th class="text-base">Name <Sort :function="sortTable"></Sort>
              </th>
              <th class="text-base">Path <Sort :function="sortTable"></Sort>
              </th>
              <th class="text-base">Last History <Sort :function="sortTable"></Sort>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="path in data.folders" @dblclick="clickFolder(path)"
              class="cb-room folder-row text-base hover:bg-blue-300 cursor-pointer">
              <td class="cb-window"><input type="checkbox" :value="path"></td>
              <td class="leading-3 text-base" colspan="6">
                <i class="material-symbols-outlined icon-shadow-base text-yellow-500 text-base mr-1">folder</i>
                <span class="text-base">{{ path.split("/").at(-1) }} </span>
              </td>
            </tr>
            <tr v-for="obj in data.csdbs" @dblclick.prevent="clickFilename(obj.filename, obj.path, obj.access_key.key)"
              class="cb-room file-row text-base hover:bg-blue-300 cursor-pointer">
              <td class="cb-window"><input file type="checkbox" :value="obj.filename" :data-filename="obj.filename" :data-access_key="obj.access_key.key"></td>
              <td class="leading-3 text-base">
                <i class="material-symbols-outlined text-slate-400 text-base mr-1">description</i>
                <span class="text-base"> {{ obj.filename }} </span>
              </td>
              <td class="leading-3 text-base"> {{ obj.path }} </td>
              <td class="leading-3 text-base"> {{ (obj.last_history.code) }}, {{ obj.last_history.created_at }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- pagination -->
      <div class="w-full text-black h-[30px] flex justify-center">
        <div v-if="pagination" class="flex justify-center items-center bg-gray-100 rounded-lg px-2 w-max">
          <button @click="goto(pageless)" data-tooltip="previous" class="material-symbols-outlined tp-top tp-left-1">navigate_before</button>
          <form @submit.prevent="goto('', pagination['current_page'])" class="flex">
            <input v-model="pagination['current_page']"
              class="w-2 text-base border-none mr-1 text-center bg-transparent font-bold" />
            <span class="font-bold text-base">of {{ pagination['last_page'] }} </span>
          </form>
          <button @click="goto(pagemore)" data-tooltip="next" class="material-symbols-outlined tp-top tp-right-1">navigate_next</button>
        </div>
      </div>
    </div>

    <ContinuousLoadingCircle />

    <FloatMenu :trigger="[{ triggerId: componentId, on: 'contextmenu' }]">
      <div v-if="$props.status === 'act'">
        <div v-if="!selectionMode" class="list" @click="openTr">
          <div>open</div>
        </div>
        <div v-if="!selectionMode" class="list" @click="edit">
          <div>edit</div>
        </div>
        <div class="list">
          <div :id="validateMenuTriggerId" class="w-full">validate</div>
        </div>
        <div class="list" @click="deleteObject">
          <div>delete</div>
        </div>
        <div class="list" @click="dispatch">
          <div>dispatch</div>
        </div>
      </div>
      <div v-else-if="$props.status === 'dct'">
        <div class="list" @click="restore">
          <div>restore</div>
        </div>
      </div>
      <hr>
      <div class="list" @click="select">
        <div>select</div>
      </div>
      <div v-if="selectionMode" class="list" @click="cancel">
        <div>cancel</div>
      </div>
      <div class="list" @click="updateList">
        <div>refresh</div>
      </div>
    </FloatMenu>
    
    <FloatMenu level="1" :use-copy-btn="false" :trigger="[{ triggerId: validateMenuTriggerId, on: 'click'}]">
      <div class="list" @click="validate('xsi')">
        <div>by xsi</div>
      </div>
      <div class="list" @click="validate('brex')">
        <div>by brex</div>
      </div>
    </FloatMenu>
    
  </div>
</template>