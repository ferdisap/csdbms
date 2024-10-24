<script>
import Property from './Property.vue'
import Remarks from '../../sub/Remarks.vue';
import { addSetLogic } from '../../../../js/util/ObjectProperty';
export default {
  components: {Property, Remarks},
  mounted() {
    // top.pdel = this;
    addSetLogic(top.document.getElementById(this._.appContext.app.windowId).property, 'data', (ctx, value) => {
      if(value instanceof Object){
        Object.keys(value).forEach(key => {
          this.$el.parentElement.querySelector(`*[name='${key}']`).value = value[key];
        })
      }
      return value;
    })
  },
}
</script>

<template>
  <Property>
    <template #content>
      <form class="border p-2" @submit.prevent.stop>
        <h1 class="text-center font-bold mb-2 text-lg">DML Entry</h1>
        <div class="w-full text-center mb-2 relative">
          <!-- entry ident -->
          <div class="relative text-left mb-2 mt-2">
            <label class="block font-semibold ml-1 mb-1">No.</label>
            <input name="no" type="number" class="p-2 ml-1 text-sm rounded-md  w-24 bg-slate-50 border">
          </div>
          <div class="relative text-left mb-2 mt-2">
            <label class="block font-semibold ml-1 mb-1">Entry Ident:</label>
            <input placeholder="DMC-..." type="text" class="p-2 w-96 ml-1 inline text-sm rounded-md bg-slate-50 border"
              name="entryIdent"
              dd-input="filename,path" 
              dd-type="csdbs" 
              dd-route="api.get_object_csdbs"
              dd-target="self">
          </div>
          <div class="relative text-left mb-2 mt-2">
            <label class="block font-semibold ml-1 mb-1">Entry Type:</label>
            <select name="dmlEntryType" class="ml-2 p-2 rounded-md bg-slate-50 border">
              <option class="text-sm" value="">---</option>
              <option class="text-sm" value="new">new</option>
              <option class="text-sm" value="changed">changed</option>
              <option class="text-sm" value="deleted">deleted</option>
            </select>
            <label class="block font-semibold ml-1 mb-1">Issue Type:</label>
            <select name="issueType" class="ml-2 p-2 rounded-md bg-slate-50 border">
              <option class="text-sm" value="">---</option>
              <option class="text-sm" value="new">new</option>
              <option class="text-sm" value="changed">changed</option>
              <option class="text-sm" value="deleted">deleted</option>
              <option class="text-sm" value="revised">revised</option>
              <option class="text-sm" value="status">status</option>
              <option class="text-sm" value="rinstate-status">rinstate-status</option>
              <option class="text-sm" value="rinstate-changed">rinstate-changed</option>
              <option class="text-sm" value="rinstate-revised">rinstate-revised</option>
            </select>
          </div>
          <div class="relative text-left mb-2 mt-2">
            <label class="block font-semibold ml-1 mb-1">Security Classification:</label>
            <select name="securityClassification" class="ml-2 p-2 rounded-md bg-slate-50 border">
              <option class="text-sm" value="">---</option>
              <option class="text-sm" value="01">Unclassified</option>
              <option class="text-sm" value="02">Classified</option>
              <option class="text-sm" value="03">Restricted</option>
              <option class="text-sm" value="04">Secret</option>
              <option class="text-sm" value="05">Top Secret</option>
            </select>
          </div>
          <div class="relative text-left mb-2 mt-2">
            <label class="block font-semibold ml-1 mb-1">Enterprise:</label>
            <!-- <input dd-input="enterprise,path" dd-type="csdbs" dd-route="api.get_object_csdbs" dd-target="self,modal_enterpriseCode" -->
            <input name="enterpriseName" placeholder="find name" type="text"
              class="ml-1 w-80 p-2 inline bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              dd-input="name,code.name" 
              dd-type="enterprises" 
              dd-route="api.get_enterprises"
              dd-target="self,modal_enterpriseCode">
            <input name="enterpriseCode" id="modal_enterpriseCode" placeholder="find code" type="text"
              class="ml-1 w-32 p-2 inline bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          </div>
          <div class="relative text-left mb-2 mt-2">
            <label class="block font-semibold ml-1 mb-1">Answer to entry:</label>
            <div class="flex space-x-2">
              <select name="answerToEntry" class="ml-2 p-2 rounded-md bg-slate-50 border h-12">
                <option class="text-sm" value="">---</option>
                <option class="text-sm" value="y">yes</option>
                <option class="text-sm" value="n">no</option>
              </select>
              <div class="border w-full px-2">
                <text-editor name="answer[]" class="w-full block mt-1"/>
              </div>
            </div>
          </div>
          <div class="relative text-left mb-2 mt-2">
            <Remarks name-attr="remarks[]" class_label="text-sm font-semibold block" />
          </div>
        </div>
      </form>
    </template>
  </Property>
</template>