<script>
import TitleBar from '../gui/TitleBar.vue';
import { installDropdown } from '../../../js/plugin/Dropdown';
export default {
  components: { TitleBar },
  mounted() {
    window.dataml = this;
  },
  props: {
    filename: {
      type: String
    }
  },
  mounted(){
    top.dml = this;
    top.installDropdown = installDropdown;
    installDropdown(this.$el.querySelector("input[name='brexDmRef']"));
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
          <form @submit.prevent="" class="mt-5 min-w-[450px] max-w-[50%] border p-3 bg-white">
            <!-- untuk DML Type -->
            <input type="hidden" value="p" name="dmlType" />
  
            <!-- untuk Model Ident Code -->
            <div class="px-2 w-full mt-2 mb-2">
              <label for="modelIdentCode" class="block text-gray-900 dark:text-white font-semibold">Model Ident Code</label>
              <input type="text" value="" name="modelIdentCode" id="modelIdentCode" placeholder="eg.: MALE" class="border p-2 rounded-md block w-full"/>
              <div class="error-form" v-html="$ersp.get('modelIdentCode')"></div>
            </div>
  
            <!-- Originator -->
            <div class="px-2 w-full mt-2 mb-2">
              <label for="originator" class="block text-gray-900 dark:text-white font-semibold">Sender / Originator CAGE Code </label>
              <input type="text" value="" name="originator" id="originator" placeholder="eg.: 0001Z" class="border p-2 rounded-md w-full"/>
              <div class="error-form" v-html="$ersp.get('originator')"></div>
            </div>
  
            <!-- Security Classification -->
            <div class="px-2 w-full mt-2 mb-2">
              <label for="securityClassification" class="block text-gray-900 dark:text-white font-semibold">Security Class </label>
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
                  <input dd-input="filename" dd-target="self" dd-type="csdbs" dd-route="api.get_csdbs" name="brexDmRef" placeholder="eg.: DMC-MALE-A-00-00-00-00A-022A-D_000-01_EN-EN" class="w-full border p-2 rounded-md" autocomplete="off" aria-autocomplete="none"/>
                </div>
                <div class="error-form" v-html="$ersp.get('brexDmRef')"></div>
              </div>
            </div>

            <!-- Remarks -->
            <div class="mb-2">
              <!-- <Remarks class_label="text-sm font-semibold" class="text-sm border-gray-300 border rounded-md p-1"/> -->
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>