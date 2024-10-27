<script>
import TitleBar from '../gui/TitleBar.vue';
import { installDropdown } from '../../../js/plugin/Dropdown';
import Remarks from '../sub/Remarks.vue';
// import routes from '../../../routes.json'
import axios from 'axios';
import { formDataToObject } from '../../../js/util/helper';
import Randomstring from 'randomstring';
import { resolve_dmIdent, resolve_dmlIdent, resolve_pmIdent, resolve_commentIdent, resolve_infoEntityIdent, resolve_dmlCode, resolve_issueDate } from '../../../js/util/S1000DHelper';
import jp from 'jsonpath';
import { installCheckbox, hideAll, select } from '../../../js/gui/Checkbox';
import { addSetLogic } from '../../../js/util/ObjectProperty';
import FloatMenu from '../menu/FloatMenu.vue';
import ContinuousLoadingCircle from '../sub/ContinuousLoadingCircle.vue';
import { style as pdeStyle } from './child/PropertyDmlEntry.vue';
import { openDetailObjectPropertyWindow } from './sub/Folder.vue';

function remarks(json, path) {
  path += '..simplePara';
  let remarks = [];
  try {
    jp.query(json, path).forEach(v => remarks.push(v[0]));
  } catch (error) {
    console.error('cannot resolve remarks element.');
  }
  return remarks;
}
function dmlContent(json) {
  return jp.query(json, '$..dmlContent')[0]
}

function getAttributeValue(json, pathToElemen, attributeName) {
  let attrValue; (attrValue =
    ((attrValue = jp.query(json, pathToElemen)[0]) ? (
      ((attrValue = attrValue.find(v => v['at_' + attributeName])) ? attrValue['at_' + attributeName] : '')
    ) : '')
  )
  return attrValue;
};

function securityClassification(json, path) {
  let sc;
  return (sc =
    ((sc = jp.query(json, path)[0]) ? sc.find(v => v['at_securityClassification']) : '')
  ) ? sc['at_securityClassification'] : '';
}

function defaultTemplateEntry(entry = {}, trId = '', cbValue = '', no = '') {
  let cbId = Randomstring.generate({ charset: 'alphabetic' });
  if (!cbValue) cbValue = entry.ident ? entry.ident : '';
  const answer = entry.answer ? entry.answer.join("<br/>") : '';
  const rm = entry.remarks ? entry.remarks.join("<br/>") : '';
  let str = `
      <tr v-on:dblclick="clickFilename" class="dmlEntry cb-room hover:bg-blue-300 cursor-pointer" ${trId ? 'id="' + trId + '"' : ''}>
        <td class="cb-window" style="display:none">
          <input file="true" id="${cbId}" value="${cbValue}" type="checkbox">
        </td>
        <td property-input-ref="no">${no}</td>
        <td property-input-ref="entryIdent" class="dmlEntry-ident">${entry.ident ?? ''}</td>
        <td>
          <span property-input-ref="dmlEntryType" class="text-sm">${entry.dmlEntryType ?? ''}</span>
          <span> | </span>
          <span property-input-ref="issueType" class="text-sm" >${entry.issueType ?? ''}</span>
        </td>
        <td property-input-ref="securityClassification">${entry.securityClassification ?? ''}</td>
        <td>
          <span property-input-ref="enterpriseName" class="text-sm">${entry.enterpriseName ?? ''}</span>   
          <span> | </span>
          <span property-input-ref="enterpriseCode" class="text-sm italic">${entry.enterpriseCode ?? ''}</span></td>
        <td>
          <span property-input-ref="answerToEntry" style="display:none">${entry.answerToEntry}</span>
          <div property-input-ref="answer[]">${answer}</div>
        </td>
        <td property-input-ref="remarks[]">${rm}</td>
      </tr>`;
  return str.replace(/\s{2,}/g, '');
  // <td property-input-ref="remarks[]">aaa<br/>bbbb</td>
}

function createEntryVueTemplate(entryData = {}) {
  let entryTemplate = '';
  Object.keys(entryData).forEach((trId, no) => {
    entryTemplate += defaultTemplateEntry(entryData[trId], trId, '', no + 1);
  })
  return entryTemplate;
}

function createEntryData(DMLObject = {}) {
  let entryData = {};
  DMLObject.content.forEach(v => {
    let entry = getEntryData(v['dmlEntry']);
    let trId = Randomstring.generate({ charset: 'alphabetic' })
    entryData[trId] = {
      ident: entry.ident,
      issueType: entry.issueType,
      dmlEntryType: entry.dmlEntryType,
      securityClassification: entry.securityClassification,
      enterpriseName: entry.enterpriseName,
      enterpriseCode: entry.enterpriseCode,
      answer: entry.answer,
      answerToEntry: entry.answerToEntry,
      remarks: entry.remarks,
    };
  })
  return entryData;
}

function getEntryData(dmlEntry) {
  let ident;
  if (ident = jp.query(dmlEntry, "$..pmRefIdent")[0]) {
    ident = resolve_pmIdent(ident);
  } else
    if (ident = jp.query(dmlEntry, "$..dmRefIdent")[0]) {
      ident = resolve_dmIdent(ident);
    } else
      if (ident = jp.query(dmlEntry, "$..dmlRefIdent")[0]) {
        ident = resolve_dmlIdent(ident);
      } else
        if (ident = jp.query(dmlEntry, "$..commentRefIdent")[0]) {
          ident = resolve_commentIdent(ident);
        } else
          if (ident = jp.query(dmlEntry, "$..infoEntityRef")[0]) {
            ident = resolve_infoEntityIdent(ident);
          }

  let issueType; issueType = (issueType = dmlEntry.find(v => v['at_issueType'])) ? issueType['at_issueType'] : '';
  let entryType; entryType = (entryType = dmlEntry.find(v => v['at_entryType'])) ? entryType['at_entryType'] : '';

  const enterpriseName = jp.query(dmlEntry, '$..responsiblePartnerCompany..enterpriseName')[0][0];
  const enterpriseCode = getAttributeValue(dmlEntry, '$..responsiblePartnerCompany', 'enterpriseCode');

  const answerToEntry = getAttributeValue(dmlEntry, '$..answer', 'answerToEntry');
  return {
    ident: ident,
    issueType: issueType,
    dmlEntryType: entryType,
    securityClassification: securityClassification(dmlEntry, '$..security'),
    enterpriseName: enterpriseName,
    enterpriseCode: enterpriseCode,
    answer: remarks(dmlEntry, '$..answer..remarks'),
    answerToEntry: answerToEntry,
    // karena element <remarks> ada di dalam answer dan dmlEntry maka tidak bisa kasi path langsung seperti '$..remarks.simplePara' karena akan mengambil remarks parennya answer juga, padahal pengennya remarks yang parentnya dmlEntry
    remarks: remarks(dmlEntry.find(v => v['remarks']), '$..remarks'),
  }
}

// hasilya sama
// pmRef1 = entry['dmlEntry'].find(v => v['pmRef'])['pmRef'];
// pmRef2 = jp.query(entry['dmlEntry'],'$..pmRef')[0]
function DML(json) {
  return {
    code: resolve_dmlCode(jp.query(json, '$..identAndStatusSection..dmlAddress..dmlIdent..dmlCode')[0], '').toUpperCase(),
    inWork: json[1]['dml'][1]['identAndStatusSection'][0]['dmlAddress'][0]['dmlIdent'][1]['issueInfo'][0]['at_inWork'],
    issueNumber: jp.query(json, '$..dmlIdent..issueInfo')[0].find(v => v['at_issueNumber'])['at_issueNumber'].toUpperCase(),
    issueDate: resolve_issueDate(jp.query(json, '$..dmlAddressItems..issueDate')[0]),
    securityClassification: securityClassification(json, '$..dmlStatus..security'),
    BREX: resolve_dmIdent(jp.query(json, '$..dmlStatus..brexDmRef..dmRefIdent')[0]),
    remarks: remarks(json, '$..dmlStatus..remarks'),
    content: dmlContent(json),
  }
}

function openPropertyWindow(windowEl) {
  const event = new Event("new-window");
  event.data = {
    parent: {
      type: 'window',
      app: windowEl,
    },
    property: {
      name: 'PropertyDmlEntry',
      style: pdeStyle(),
    }
  }
  top.dispatchEvent(event);
}

function getPropertyInputName(tr) {
  const pir = tr.querySelectorAll("*[property-input-ref]");
  const data = {};
  for (let i = 0; i < pir.length; i++) {
    const name = pir[i].getAttribute("property-input-ref");
    if (name.substr(name.length - 2) === '[]') {
      if (!data[name]) data[name] = [];
      data[name].push(pir[i].textContent);
    } else {
      data[name] = pir[i].textContent;
    }
  }
  return data;
}

function setPropertyInputName(tr, data) {
  Object.keys(data).forEach(key => {
    if (data[key] instanceof Array) {
      tr.querySelectorAll(`*[property-input-ref='${key}[]']`).forEach((el, i) => {
        el.textContent = data[key][i];
      })
    } else {
      tr.querySelector(`*[property-input-ref='${key}']`).textContent = data[key];
    }
  })
}

function getAllValues() {
  const values = {};
  const allNamed = this.$el.querySelectorAll('.dmlIdentAndStatusSection *[name]');
  const allEntries = this.$el.querySelectorAll('table tbody tr');
  values.ident = {};
  allNamed.forEach(el => {
    let key = el.name;
    let value = el.value;
    if (key.substring(key.length - 2) === '[]') {
      key = key.substring(0, key.length - 2)
      value = value.split(/<br\/>|<br>/g); // atau di replace dengan "\n" sesuai backend nya sekarang pakai array (split)
    };
    values.ident[key] = value;
  })
  values.entries = []
  allEntries.forEach((tr, i) => {
    const obj = {};
    tr.querySelectorAll("*[property-input-ref]").forEach(input => {
      let key = input.getAttribute('property-input-ref');
      let value = input.textContent;
      if (key.substring(key.length - 2) === '[]') {
        key = key.substring(0, key.length - 2)
        value = value.split(/<br\/>|<br>/g); // atau di replace dengan "\n" sesuai backend nya sekarang pakai array (split)
      };
      obj[key] = value;
    })
    values.entries.push(obj);
  })
  return values;
}

export default {
  components: { ContinuousLoadingCircle, FloatMenu, Remarks, TitleBar },
  data() {
    return {
      DMLType: '',
      DMLObject: {},
      dmlEntryVueTemplate: '',
      selectionMode: false,
      dmlContentId: Randomstring.generate({ charset: 'alphabetic' }),
      dmlIdentStatusId: Randomstring.generate({ charset: 'alphabetic' }),
    }
  },
  props: {
    filename: {
      type: String
    }
  },
  computed: {
    isDML() {
      return this.$props.filename && (this.$props.filename.substring(this.$props.filename.length - 4) === '.xml') && (this.$props.filename.substring(0, 3) === 'DML');
    },
    entries() {
      return {
        template: this.dmlEntryVueTemplate,
        methods:{
          clickFilename(event){
            openDetailObjectPropertyWindow(this.$el.parentElement.closest(".app-window"),event.target.closest(".cb-room").cbWindow.cbValue);
          }
        },
        mounted() {
          const cbHome = this.$el.parentElement.closest('.cb-home')
          installCheckbox(cbHome);
          try {
            addSetLogic(cbHome, 'sm', (ctx, value) => {
              this.$parent.selectionMode = value;
              return value;
            })
          } catch (error) { }
        }
      }
    }
  },
  methods: {
    createDML(event) {
      this.clp(true);
      axios.put("/api/s1000d/dml/create", formDataToObject(new FormData(event.target)))
        .then(response => {
          top.rsp = response;
          this._.props.filename = response.data.csdb.filename;
          this.showContent(response.data.csdb.filename)
        })
        .finally(() => this.clp(false))
    },
    updateDML() {
      this.clp(true);
      axios.post("/api/s1000d/dml/update/" + this.$props.filename, getAllValues.call(this))
        .then(response => {
          this._.props.filename = response.data.csdb.filename;
          this.showContent(response.data.csdb.filename)
        })
        .finally(() => this.clp(false))
    },
    mergeDML(event) {
      this.clp(true);
      axios.put("/api/s1000d/dml/merge/" + this.$props.filename, formDataToObject(new FormData(event.target)))
        .then(response => {
          this._.props.filename = response.data.csdb.filename;
          this.showContent(response.data.csdb.filename)
        })
        .finally(() => this.clp(false))
    },
    showContent(filename) {
      this.clp(true);
      axios({
        url: "/api/s1000d/csdb/read/" + filename,
        method: 'GET',
        params: { form: 'json' }
      })
        .then(response => {
          this.DMLObject = DML(response.data.json);
          this.DMLType = response.data.csdb.object.dmlType;

          // create entries string
          const dmlEntryData = createEntryData(this.DMLObject);
          this.dmlEntryVueTemplate = createEntryVueTemplate(dmlEntryData);
        })
        .finally(() => this.clp(false))
    },
    add() {
      const windowEl = this.$el.parentElement.closest(".app-window");
      openPropertyWindow(windowEl);
      windowEl.property.result()
        .then(data => {
          const cbRoom = top.FloatMenu.event.target.closest(".cb-room");
          const trString = defaultTemplateEntry({
            ident: data.entryIdent,
            dmlEntryType: data.dmlEntryType,
            issueType: data.issueType,
            securityClassification: data.securityClassification,
            enterpriseName: data.enterpriseName,
            enterpriseCode: data.enterpriseCode,
            answerToEntry: data.answerToEntry,
            answer: data.answer,
            remarks: data.remarks,
          }, '', data.entryIdent);
          cbRoom.insertAdjacentHTML('afterend', trString);
          installCheckbox(cbRoom.closest('.cb-home'));
        });
    },
    edit() {
      const cbRoom = top.FloatMenu.event.target.closest(".cb-room");
      if (cbRoom.parentElement.tagName === 'THEAD') return;
      const windowEl = this.$el.parentElement.closest(".app-window");
      openPropertyWindow(windowEl);
      windowEl.property.data = getPropertyInputName(cbRoom);
      windowEl.property.result()
        .then(data => {
          setPropertyInputName(cbRoom, data);
        });
    },
    remove() {
      const cbHome = this.$el.querySelector('.cb-home');
      const cbs = cbHome.cb;
      if (cbs.length) {
        cbs.forEach(cb => cb.closest(".cb-room").remove());
      } else {
        if (cbHome.current.parentElement.tagName === 'THEAD') return;
        cbHome.current.remove();
      }
      hideAll(cbHome);
    },
    cancelCB() {
      hideAll(this.$el.querySelector('.cb-home'));
    },
    selectCB: select,
  },
  mounted() {
    // top.dml = this;
    // top.jp = jp;
    // top.installDropdown = installDropdown;
    // installDropdown(this.$el.querySelector("input[name='brexDmRef']"));

    if (this.isDML) {
      this.showContent(this.$props.filename)
      installDropdown(this.$el.querySelector("input[name='ident-brexDmRef']"));
      installDropdown(this.$el.querySelector("input[dd-name='filename']"));
    } else {
      this._.props.filename = undefined;
      installDropdown(this.$el.querySelector("input[name='brexDmRef']"));
    }
  }
}
</script>

<template>
  <div class="dml h-full w-full border shadow-md bg-slate-50">
    <TitleBar title="Data Management List" />
    <div class="h-[calc(100%-3rem)] w-full">
      <div v-if="!$props.filename">
        <h1 class="text-center text-3xl mt-2 text-blue-500 underline font-extrabold">New DML</h1>
        <div class="w-full flex justify-center">
          <form @submit.prevent="createDML" class="mt-5 min-w-[450px] max-w-[50%] border p-3 bg-white">
            <!-- untuk DML Type -->
            <input type="hidden" value="p" name="dmlType" />

            <!-- untuk Model Ident Code -->
            <div class="px-2 w-full mt-2 mb-2">
              <label for="modelIdentCode" class="block text-gray-900 dark:text-white font-semibold">Model Ident
                Code</label>
              <input type="text" value="" name="modelIdentCode" id="modelIdentCode" placeholder="eg.: MALE"
                class="border p-2 rounded-md block w-full" />
              <div class="error-form" v-html="$ersp.get('modelIdentCode')"></div>
            </div>

            <!-- Originator -->
            <div class="px-2 w-full mt-2 mb-2">
              <label for="originator" class="block text-gray-900 dark:text-white font-semibold">Sender / Originator CAGE
                Code </label>
              <input type="text" value="" name="originator" id="originator" placeholder="eg.: 0001Z"
                class="border p-2 rounded-md w-full" />
              <div class="error-form" v-html="$ersp.get('originator')"></div>
            </div>

            <!-- Security Classification -->
            <div class="px-2 w-full mt-2 mb-2">
              <label for="securityClassification" class="block text-gray-900 dark:text-white font-semibold">Security Class
              </label>
              <select name="securityClassification" id="securityClassification" class="border p-2 rounded-md w-full">
                <option class="text-sm" value="01">Unclassified</option>
                <option class="text-sm" value="02">Restricted</option>
                <option class="text-sm" value="03">Confidential</option>
                <option class="text-sm" value="04">Secret</option>
                <option class="text-sm" value="05">Top Secret</option>
              </select>
              <div class="error-form" v-html="$ersp.get('securityClassification')"></div>
            </div>

            <!-- BREX -->
            <div class="px-2 w-full mt-2 mb-2">
              <label class="block text-gray-900 dark:text-white font-semibold">Brex </label>
              <div class="mr-2 w-full relative">
                <div class="w-full">
                  <input dd-input="filename" dd-target="self" dd-type="csdbs" dd-route="api.get_csdbs" name="brexDmRef"
                    placeholder="eg.: DMC-MALE-A-00-00-00-00A-022A-D_000-01_EN-EN" class="w-full border p-2 rounded-md"
                    autocomplete="off" aria-autocomplete="none" />
                </div>
                <div class="error-form" v-html="$ersp.get('brexDmRef')"></div>
              </div>
            </div>

            <!-- Remarks -->
            <div class="px-2 w-full mt-2 mb-2">
              <Remarks class-label="text-sm font-semibold" class="border border-gray-300 rounded-md p-1" />
            </div>

            <button type="submit" class="button-violet mt-2 float-end">Submit</button>
          </form>
        </div>
      </div>
      <div v-else class="h-full w-full">
        <h1 class="text-center text-3xl mt-2 h-12 text-blue-500 underline font-extrabold">
          {{ DMLType === 'p' ? ('Partial DML') : (DMLType === 'c' ? 'Complete DML' : (DMLType === 's' ? 'Status DML' : '')
          ) }}</h1>
        <div class="h-[calc(100%-3rem)] flex justify-center px-4">
          <form @submit.prevent="updateDML" class="border bg-white px-2 h-[calc(100%-10px)] overflow-auto max-w-[75%]">
            <!-- dmlIdentAndStatus -->
            <div class="dmlIdentAndStatusSection mb-3" :id="dmlIdentStatusId">
              <div class="mb-2 flex space-x-2">
                <div class="mr-2 mb-2 p-2">
                  <div class="font-bold italic mb-1">Code</div>
                  <div class="border p-2">{{ DMLObject.code }}</div>
                </div>
                <div class="mr-2 mb-2 p-2">
                  <div class="font-bold italic mb-1">InWork</div>
                  <div class="border p-2 text-center">{{ DMLObject.inWork }}</div>
                </div>
                <div class="mr-2 mb-2 p-2">
                  <div class="font-bold italic mb-1">Issue</div>
                  <div class="border p-2 text-center">{{ DMLObject.issueNumber }}</div>
                </div>
                <div class="mr-2 mb-2 p-2">
                  <div class="font-bold italic mb-1">Date</div>
                  <div class="border p-2">{{ DMLObject.issueDate }}</div>
                </div>
              </div>
              <div class="mb-2 flex">
                <div class="mr-2">
                  <div class="font-bold italic mb-1">Security</div>
                  <input type="number" name="ident-securityClassification" :value="DMLObject.securityClassification"
                    class="w-20 bg-white border p-2" />
                </div>
                <div class="mr-2 w-96">
                  <div class="font-bold italic mb-1">BREX</div>
                  <input dd-input="filename" dd-target="self" dd-type="csdbs" dd-route="api.get_csdbs"
                    name="ident-brexDmRef" :value="DMLObject.BREX"
                    placeholder="eg.: DMC-MALE-A-00-00-00-00A-022A-D_000-01_EN-EN" class="w-full border p-2 rounded-md"
                    autocomplete="off" aria-autocomplete="none" />
                </div>
              </div>
              <div class="mb-2">
                <Remarks :para="DMLObject.remarks" class_label="text-sm font-bold italic mb-1" class="border p-2"
                  nameAttr="ident-remarks" />
              </div>
            </div>
            <!-- dmlContent -->
            <div class="mt-3 border p-2">
              <table class="cb-home" :id="dmlContentId">
                <thead>
                  <tr class="cb-room">
                    <th class="cb-window-all" style="display:none"><input type="checkbox"></th>
                    <th>No</th>
                    <th>Ident</th>
                    <th>Type</th>
                    <th>Security</th>
                    <th>Company</th>
                    <th>Answer</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody><component v-if="dmlEntryVueTemplate" :is="entries"/></tbody>
              </table>
            </div>
            <!-- submit button -->
            <div v-if="DMLType !== 's'" class="text-center mt-3 mb-3">
              <button type="submit" class="button bg-violet-400 text-white hover:bg-violet-600">Update</button>
            </div>
          </form>

          <form @submit.prevent="mergeDML" class="border p-2 text-center max-w-[250px] h-[calc(100%-10px)] overflow-auto">
            <div class="text-center">
              <label class="font-semibold mb-2 block">Merge DML</label>
              <input placeholder="search filename" type="text" class="p-2 w-full ml-1text-sm rounded-lg border"
                dd-name="filename" dd-input="filename,path" dd-type="csdbs" dd-route="api.get_csdbs"
                dd-target="mergesourcecontainer-append">
            </div>
            <textarea rows="15" id="mergesourcecontainer" merge-source-container name="source" class="w-full block p-2 my-2 border"></textarea>
            <button type="submit" class="button text-center bg-violet-400 text-white hover:bg-violet-600">Merge</button>
          </form>
        </div>
      </div>
    </div>
    <FloatMenu v-if="isDML" :trigger="[{ triggerId: dmlContentId, on: 'contextmenu' }]">
      <div v-if="!selectionMode">
        <div class="list" @click="add">
          <div>add</div>
        </div>
        <div class="list" @click="edit">
          <div>edit</div>
        </div>
      </div>
      <div v-else>
        <div v-if="selectionMode" class="list" @click="cancelCB">
          <div>cancel</div>
        </div>
      </div>
      <div class="list" @click="selectCB">
        <div>select</div>
      </div>
      <div class="list" @click="remove">
        <div>remove</div>
      </div>
    </FloatMenu>
    <FloatMenu v-if="isDML" :trigger="[{ triggerId: dmlIdentStatusId, on: 'contextmenu' }]" />
    <ContinuousLoadingCircle />
  </div>
</template>

<style>
.dml table {
  width: 100%;
}

.dml th,
.dml td {
  border-right: 1px dashed grey;
  padding: 0.25rem;
  text-align: center;
}

.dml th {
  border-bottom: 0.25rem solid black;
}

.dml table th:nth-child(1) {
  width: 3%;
}

.dml table th:nth-child(2) {
  width: 5%;
}

.dml table th:nth-child(3),
.dml table td:nth-child(3) {
  text-align: left;
}

.dml table th:nth-child(4) {
  width: 10%
}

.dml table th:nth-child(5) {
  width: 10%
}

.dml table th:nth-child(6) {
  width: 25%
}

.dml table th:nth-child(7) {
  width: 10%
}

.dml table th:nth-child(8) {
  width: 15%
}
</style>