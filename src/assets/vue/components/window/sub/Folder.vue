<script>
import { installCheckbox, cancel, select } from '../../../../js/gui/Checkbox';
import { copy } from '../../../../js/util/helper.js';
// import Sort from "../../../techpub/components/Sort.vue";
import Sort from '../../gui/Sort.vue';
import ContinuousLoadingCircle from "../../sub/ContinuousLoadingCircle.vue";
import FloatMenu from '../../menu/FloatMenu.vue';
// import {
//   getObjs, storingResponse, goto, back, clickFolder, clickFilename, download, validate,
//   sortTable, search, removeList, remove, pushFolder, dispatch, changePath, deleteObject, refresh
// } from './FolderVue'
import axios from "axios";
import Randomstring from 'randomstring';

export default {
  components: { FloatMenu, Sort, ContinuousLoadingCircle },
  data() {
    return {
      data: {},
      open: {},
      componentId: Randomstring.generate({ charset: 'alphabetic' })      
    }
  },
  props: {
    path: {
      type: String,
      default: 'csdb'
    }
  },
  computed: {
    models() {
      return this.data.csdb;
    },
    folders() {
      return this.data.folders;
    },
    sc() {
      return this.data.sc;
    },
    currentPath() {
      return this.$props.path;
      // return this.data.current_path ? this.data.current_path : '';
    },
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
      axios({
        url: "/api/s1000d/path/" + path,
        method: 'GET',
        data: data
      })
        .then(response => this.storingResponse(response))
        .finally(() => {
          installCheckbox(this.$el.querySelector(".cb-home"))
        })
    },
    storingResponse: function (response) {
      if (response.statusText === 'OK' || ((response.status >= 200) && (response.status < 300))) {
        this.data.csdb = response.data.pagination.data; // array contain object csdb
        this.data.folders = response.data.paths; // array contain string path
        this._.props.path = response.data.path;
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
    back: async function (path = undefined) {
      if (!path) path = this.currentPath.replace(/\/\w+\/?$/, "");
      this.getObjs({ path: path });
    },
    clickFolder: function (path) {
      this.back(path);
    },
    clickFilename: async function (filename) {
      console.log("filename clicked", filename)
      const event = new Event("new-window");
      event.data = {
        window: {
          name: 'XMLEditor',
          props: {
            filename: filename
          }
        },
        task: {
          props: {
            title: 'XMLEditor'
          }
        }
      }
      top.dispatchEvent(event);
    },
    sortTable: function sortTable(event) {
      const getCellValue = function (row, index) {
        return $(row).children('td').eq(index).text();
      };
      const comparer = function (index) {
        return function (a, b) {
          let valA = getCellValue(a, index), valB = getCellValue(b, index);
          // return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB);
          return isNumber(valA) && isNumber(valB) ? valA - valB : valA.toString().localeCompare(valB);
        }
      };
      let table = $(event.target).parents('table').eq(0);
      let th = $(event.target).parents('th').eq(0);
      if (th.index() === 0) {
        let filerows = table.find('.file-row').toArray().sort(comparer(th.index()));
        let folderrows = table.find('.folder-row').toArray().sort(comparer(th.index()));
        this.asc = !this.asc;
        if (!this.asc) {
          filerows = filerows.reverse();
          folderrows = folderrows.reverse();
        }
        for (let i = 0; i < folderrows.length; i++) {
          table.append(folderrows[i]);
        }
        for (let i = 0; i < filerows.length; i++) {
          table.append(filerows[i]);
        }
      } else {
        let filerows = table.find('.file-row').toArray().sort(comparer(th.index()));
        this.asc = !this.asc;
        if (!this.asc) {
          filerows = filerows.reverse();
        }
        for (let i = 0; i < filerows.length; i++) {
          table.append(filerows[i]);
        }
      }
    },
    search: function () {
      this.getObjs(this.$props.path, { sc: this.data.sc });
    },
    removeList: function (filename) {
      let csdb = this.data.csdb.find((obj) => obj.filename === filename);
      let index = this.data.csdb.indexOf(csdb);
      this.data.csdb.splice(index, 1);
      return csdb;
    },
    dispatch: async function (cond = 0) {
      alert("dispatch");
      // const emitName = !cond ? 'dispatchTo' : 'AddDispatchTo';
      // const csdbs = await this.CB.value();
      // this.CB.cancel();
      // if (!csdbs) return;
      // this.emitter.emit(emitName, csdbs);
    },
    changePath: function () {
      alert("change path")
    },
    deleteObject: async function () {
      // fetch

      axios({
        url: "/api/s1000d/csdb/delete",
        method: 'DELETE',
        data: { filename: this.$el.querySelector(".cb-home").cbValues },
      })
        .then(response => {
          // hapus list di folder, tidak seperti listtree yang ada level dan list model, dan emit csdbDelete
          const csdbDeleted = [];
          response.data.success.forEach((filename) => {
            let csdb = this.removeList(filename);
            if (csdb) csdbDeleted.push(csdb); // aman walau pakai csdb ada dalam proxy
            else csdbDeleted.push({ filename: filename, path: '' }); // path TBD. karena CB.value() hanya mengembalikan value saja
          });
        })
    },
    pushFolder: function (path) {
      if (path.split("/").length > this.$props.path.split("/").length) {
        this.data.folders.push(path);
        this.data.folders = array_unique(this.data.folders);
      }
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
      alert("validate by " + type);
      // let route;
      // switch (type) {
      //   case 'brex':
      //     route = RoutesWeb.get('api.validate_by_brex', {
      //       filename: await this.CB.value(),
      //     });
      //     break;
      //   default:
      //     break;
      // }
      // axios({
      //   route: route
      // });
    },
    // checkbox
    select: select,
    cancel: cancel,

    // emit
    refresh: function (data) {
      // let to = 0;
      if (isArray(data)) {
        data.forEach((obj) => {
          this.getObjs({ path: obj.path })
        });
      } else {
        if (data && data.path) this.getObjs(data.path)
        else this.getObjs(this.$props.path)
      }
    },
    remove: function (data) {
      if (isArray(data)) {
        data.forEach((obj) => {
          if (obj.path) {
            this.removeList(obj.filename);
          }
        });
      } else {
        this.getObjs(this.$props.path)
      }
    },

    copy: copy,
  },
  mounted() {
    this.getObjs(this.$props.path);
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
  <div :id="componentId" class="folder h-full w-full shadow-md border p-2">
    <div class="h-[100%] w-full relative overflow-x-auto">

      <div class="h-[50px] mb-3 flex items-center space-x-4">
        <button @click="back()" class="material-symbols-outlined has-tooltip-right hover:bg-gray-100 block"
          data-tooltip="back">keyboard_backspace</button>
        <h1 class="text-2xl inline w-full"><span>#/</span>{{ currentPath.toUpperCase() }}</h1>
        <div class="space-x-4 w-full flex">
          <input @change="search()" v-model="this.data.sc" placeholder="find filename" type="text" class="w-full inline bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <button class="material-icons mx-3 text-gray-500 text-base has-tooltip-arrow inline" data-tooltip="info" @click="$root.info({ name: 'searchCsdbObject' })">info</button>
        </div>
      </div>

      <div class="h-[calc(100%-90px)] overflow-y-auto">
        <table class="cb-home w-full">
          <thead class="text-base text-left border-b-2 h-10">
            <tr class="leading-3 text-base cb-room">
              <th style="display:none" class="cb-window-all"><input type="checkbox"></th>
              <th class="text-base">Name <Sort :function="sortTable"></Sort></th>
              <th class="text-base">Path <Sort :function="sortTable"></Sort></th>
              <th class="text-base">Last History <Sort :function="sortTable"></Sort></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="path in folders" cb-room="folder" @dblclick="clickFolder(path)"
              class="cb-room folder-row text-base hover:bg-blue-300 cursor-pointer">
              <td class="cb-window"><input type="checkbox" :value="path"></td>
              <td class="leading-3 text-base" colspan="6">
                <span class="material-symbols-outlined text-base mr-1">folder</span>
                <span class="text-base">{{ path.split("/").at(-1) }} </span>
              </td>
            </tr>
            <tr v-for="obj in models" cb-room @dblclick.prevent="clickFilename(obj.filename)"
              class="cb-room file-row text-base hover:bg-blue-300 cursor-pointer">
              <td class="cb-window"><input file type="checkbox" :value="obj.filename"></td>
              <td class="leading-3 text-base">
                <span class="material-symbols-outlined text-base mr-1">description</span>
                <span class="text-base"> {{ obj.filename }} </span>
              </td>
              <td class="leading-3 text-base"> {{ obj.path }} </td>
              <td class="leading-3 text-base"> {{ (obj.last_history.description) }}, {{ obj.last_history.created_at }} </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- pagination -->
      <div class="w-full text-black h-[30px] flex justify-center">
        <div v-if="pagination" class="flex justify-center items-center bg-gray-100 rounded-lg px-2 w-max">
          <button @click="goto(pageless)" class="material-symbols-outlined">navigate_before</button>
          <form @submit.prevent="goto('', pagination['current_page'])" class="flex">
            <input v-model="pagination['current_page']"
              class="w-2 text-base border-none text-center bg-transparent font-bold" />
            <span class="font-bold text-base"> of {{ pagination['last_page'] }} </span>
          </form>
          <button @click="goto(pagemore)" class="material-symbols-outlined">navigate_next</button>
        </div>
      </div>
    </div>

    <ContinuousLoadingCircle />

    <FloatMenu :trigger="[{triggerId: componentId, on:'contextmenu'}]">
      <div class="list" @click="updateList">
        <div>refresh</div>
      </div>
      <div class="list" @click="open">
        <div>open</div>
      </div>
      <div class="list" @click="remove">
        <div>delete</div>
      </div>
      <div class="list" @click="cancel">
        <div>cancel</div>
      </div>
      <div class="list" @click="select">
        <div>select</div>
      </div>
    </FloatMenu>
  </div>
</template>