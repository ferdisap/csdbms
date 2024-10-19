<script>
import { installCheckbox, cancel, select } from '../../../../js/gui/Checkbox';
import { copy, isArray } from '../../../../js/util/helper.js';
import Sort from '../../gui/Sort.vue';
import ContinuousLoadingCircle from "../../sub/ContinuousLoadingCircle.vue";
import FloatMenu from '../../menu/FloatMenu.vue';
import axios from "axios";
import Randomstring from 'randomstring';
import SearchCsdb from '../../sub/SearchCsdb.vue';
import { addSetLogic } from '../../../../js/util/ObjectProperty';
import { isNumber } from '../../../../js/util/helper.js';

export default {
  components: { FloatMenu, Sort, ContinuousLoadingCircle, SearchCsdb },
  data() {
    return {
      data: {},
      open: {},
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
      selectionMode: false,
    }
  },
  props: {
    path: {
      type: String,
      default: 'csdb'
    },
    status: {
      type: String,
    }
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
      data.stt = this.$props.status;
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
      if (!path) path = this.$props.path.replace(/\/\w+\/?$/, "");
      this.getObjs(path);
    },
    clickFolder: function (path) {
      this.back(path);
    },
    clickFilename: async function (filename) {
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
    openTr() {
      const cbHome = this.$el.querySelector('.cb-home');
      if (cbHome.current && cbHome.current.matches(".file-row")) this.clickFilename(cbHome.current.cbWindow.cbValue)
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
      let th = event.target.closest('th');
      const index = [...th.parentElement.children].indexOf(th)
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
        window: {
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
    onSearchSuccess: function (response) {
      this.storingResponse(response);
      installCheckbox(this.$el.querySelector(".cb-home"));
      this.clp(false);
    }
  },
  mounted() {
    addSetLogic(this.$el.querySelector(".cb-home"), 'sm', (ctx, value) => {
      this.selectionMode = value;
      return value;
    })
    this.getObjs(this.$props.path);
    // top.folder = this;
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
        <h1 class="text-2xl inline w-full"><span>#/</span>{{ this.$props.path.toUpperCase() }}</h1>
        <SearchCsdb :path="$props.path" @start="() => clp(true)" @success="onSearchSuccess" :status="$props.status" />
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
                <span class="material-symbols-outlined text-base mr-1">folder</span>
                <span class="text-base">{{ path.split("/").at(-1) }} </span>
              </td>
            </tr>
            <tr v-for="obj in data.csdbs" @dblclick.prevent="clickFilename(obj.filename)"
              class="cb-room file-row text-base hover:bg-blue-300 cursor-pointer">
              <td class="cb-window"><input file type="checkbox" :value="obj.filename"></td>
              <td class="leading-3 text-base">
                <span class="material-symbols-outlined text-base mr-1">description</span>
                <span class="text-base"> {{ obj.filename }} </span>
              </td>
              <td class="leading-3 text-base"> {{ obj.path }} </td>
              <td class="leading-3 text-base"> {{ (obj.last_history.description) }}, {{ obj.last_history.created_at }}
              </td>
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

    <FloatMenu :trigger="[{ triggerId: componentId, on: 'contextmenu' }]">
      <div v-if="$props.status === 'act'">
        <div v-if="!selectionMode" class="list" @click="openTr">
          <div>open</div>
        </div>
        <div class="list" @click="deleteObject">
          <div>delete</div>
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
  </div>
</template>