<script>
import TitleBar from '../gui/TitleBar.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import FloatMenu from '../menu/FloatMenu.vue';
import jp from 'jsonpath';
import { jsonFileGetRemarks, resolve_dmIdent, resolve_ddnCode, resolve_issueDate } from '../../../js/util/S1000DHelper';
import axios from 'axios';
import Remarks from '../sub/Remarks.vue';
import { installCheckbox, select, cancel } from '../../../js/gui/Checkbox';
import Randomstring from 'randomstring';
import { addSetLogic } from '../../../js/util/ObjectProperty';
import { openFile, openDetailObjectPropertyWindow } from './sub/Folder.vue';

function openDialogOverWriteImport(windowEl, filenames) {
  filenames = filenames.map(v => v = "<code class='filename'>" + v + "</code>");
  const event = new Event("new-window");
  event.data = {
    parent: {
      type: 'window',
      app: windowEl,
    },
    dialog: {
      props: {
        instruction: "Do you want to overwrite csdb file?",
        options: "filenames(" + filenames.length + " ea) : " + filenames.join(","),
        footer: "The overwrited file will not able to restore its previous content!",
        infotype: 'warning'
      },
    }
  }
  top.dispatchEvent(event);
}

function DDN(json) {
  return {
    code: resolve_ddnCode(jp.query(json, '$..identAndStatusSection..ddnAddress..ddnIdent..ddnCode')[0], '').toUpperCase(),
    issueDate: resolve_issueDate(jp.query(json, '$..ddnAddressItems..issueDate')[0]),
    securityClassification: jp.query(json, '$..ddnStatus..security..at_securityClassification')[0],
    brex: resolve_dmIdent(jp.query(json, '$..ddnStatus..brexDmRef..dmRefIdent')[0]),
    remarks: jsonFileGetRemarks(json, '$..ddnStatus..remarks'),
    // dispatchFileNames: jp.query(json, '$..dispatchFileName'),
    dispatchFileNames: jp.query(json, '$..dispatchFileName').map(v => v = v[0]),
    mediaIdents: jp.query(json, '$..mediaIdent').map(v => v = v[0]),
  }
}


export default {
  components: { ContinuousLoadingCircle, FloatMenu, Remarks, TitleBar },
  props: {
    filename: {
      type: String
    }
  },
  data() {
    return {
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
      DDNObject: {},
      selectionMode: undefined,
      owner: {},
    }
  },
  methods: {
    select: select,
    cancel: cancel,
    showContent(filename) {
      this.clp(true);
      axios({
        url: "/api/s1000d/csdb/read/" + filename,
        method: 'GET',
        params: { form: 'json' }
      })
        .then(response => {
          this.DDNObject = DDN(response.data.json);
          this.owner = response.data.csdb.owner
          setTimeout(installCheckbox, 0, this.$el.querySelector(".cb-home"))
        })
        .finally(() => this.clp(false))
    },
    importCsdb() {
      const cbHome = this.$el.querySelector(".cb-home");
      let filenames = cbHome.cbValues;
      if (!filenames.length) filenames = [cbHome.current.cbWindow.cbValue];
      const put = (data) => {
        axios.put("/api/s1000d/csdb/import/" + this.$props.filename, data)
          .then(response => {
            // console.log(top.rsp = response);
          })
          .catch(async (error) => {
            // console.log(top.err = error);
            if (error.status == 499) {
              const windowEl = this.$el.closest(".app-window");
              openDialogOverWriteImport(windowEl, error.response.data.errors.failure)
              if (await windowEl.dialog.result()) {
                put({
                  filenames: filenames,
                  overwrite: 1
                })
              }
            }
          })
      }
      put({ filenames: filenames })
    },
    openDetail(filename){
      openDetailObjectPropertyWindow(this.$el.closest(".app-window"), filename, this.owner.storage, undefined, {params: {csdbRef: this.$props.filename}});
    },
    open(filename) {
      if (filename) {
        console.log(filename)
        openFile({
          filename: filename,
          route: {
            params: {
              csdbRef: this.$props.filename
            }
          }
        });
        return;
      }
      const cbHome = this.$el.querySelector(".cb-home");
      openFile({
        filename: cbHome.current.cbWindow.cbValue,
        route: {
          params: {
            csdbRef: this.$props.filename
          }
        }
      });
    }
  },
  mounted() {
    addSetLogic(this.$el.querySelector(".cb-home"), 'sm', (ctx, value) => {
      this.selectionMode = value;
      return value;
    });
    this.showContent(this.$props.filename)
  }
}
</script>
<template>
  <div :id="componentId" class="ddn h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="Data Management List" />
    <div class="h-[calc(100%-3rem)] w-full">
      <div v-if="!$props.filename">
        <!-- TBD this will provide the view of making a DDN, such like PropertyDispatchTo -->
      </div>
      <div v-else class="h-full w-full">
        <h1 class="text-center text-3xl mt-2 h-12 text-blue-500 underline font-extrabold">DDN</h1>
        <div class="h-[calc(100%-3rem)] flex justify-center px-4">
          <form @submit.prevent class="border bg-white px-2 h-[calc(100%-10px)] overflow-auto w-full max-w-[75%]">
            <div class="ddnIdentAndStatusSection mb-3">
              <div class="mb-2 flex space-x-2">
                <div class="mr-2 mb-2 p-2">
                  <div class="font-bold italic mb-1">Code</div>
                  <div class="border p-2">{{ DDNObject.code }}</div>
                </div>
                <div class="mr-2 mb-2 p-2">
                  <div class="font-bold italic mb-1">Date</div>
                  <div class="border p-2 text-center">{{ DDNObject.issueDate }}</div>
                </div>
              </div>
              <div class="mb-2 flex">
                <div class="mr-2">
                  <div class="font-bold italic mb-1">Security</div>
                  <div class="w-20 bg-white border p-2">{{ DDNObject.securityClassification }}</div>
                </div>
                <div class="mr-2 w-96">
                  <div class="font-bold italic mb-1">BREX</div>
                  <div class="w-full bg-white border p-2">{{ DDNObject.brex }}</div>
                </div>
              </div>
              <div class="mb-2">
                <Remarks :para="DDNObject.remarks" class_label="text-sm font-bold italic mb-1" class="border p-2"
                  nameAttr="ident-remarks" />
              </div>
            </div>

            <div class="ddnContent">
              <table class="cb-home">
                <thead>
                  <tr class="cb-room">
                    <th class="cb-window-all"><input type="checkbox" /></th>
                    <th class="text-left px-2">No</th>
                    <th class="text-left px-2">Filename</th>
                  </tr>
                </thead>
                <tbody v-if="DDNObject.dispatchFileNames && DDNObject.dispatchFileNames.length">
                  <tr v-for="(filename, i) in DDNObject.dispatchFileNames" class="cb-room" @dblclick="openDetail(filename)">
                    <td class="cb-window">
                      <input type="checkbox" :value="filename">
                    </td>
                    <td class="text-left px-2">{{ i + 1 }}</td>
                    <td class="text-left px-2">{{ filename }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </div>
    </div>
    <ContinuousLoadingCircle />
    <FloatMenu :trigger="[{ triggerId: componentId, on: 'contextmenu' }]">
      <div class="list" @click="importCsdb">
        <div>import</div>
      </div>
      <div class="list" @click="select">
        <div>select</div>
      </div>
      <div v-if="selectionMode">
        <div class="list" @click="cancel">
          <div>cancel</div>
        </div>
      </div>
      <div v-else>
        <div class="list" @click="open()">
          <div>open</div>
        </div>
      </div>
    </FloatMenu>
  </div>
</template>