<script>
import Property from './Property.vue';
import { installDropdown } from '../../../../js/plugin/Dropdown.js';

export default {
  components: { Property },
  props: {
    errors: { type: Object, default: {} },

    commentRefs: { type: String },
    countryIsoCode: { type: String },
    languageIsoCode: { type: String },
    securityClassification: { type: String },
    
    brexDmRef: { type: String },

    parentCommentFilename: { type: String },
    position: { type: [Number, String] },
    commentType: { type: String },
    commentPriorityCode: { type: String },
    responseType: { type: String },
    remarks: { type: String, default: '' },
  },
  mounted() {
    installDropdown(this.$el.querySelector("input[name='brexDmRef']"));
    installDropdown(this.$el.querySelector("input[name='commentRefs']"));
    top.pccp = this;
  }
}
</script>
<template>
  <Property title="Preferences Comment">
    <template #content>
      <form @submit.prevent class="border p-2">
        <h1 class="text-center font-bold mb-2 text-lg">Preferences</h1>
        <div class="w-full text-center mb-2 relative">
          <input class="hidden" name="parentCommentFilename" :value="$props.parentCommentFilename" />
          <input class="hidden" name="position" :value="$props.position" />
          <input class="hidden" name="commentType" :value="$props.commentType" />

          <div class="w-full text-center mb-2 relative">
            <!-- comment title -->
            <div class="relative text-left mb-2 mt-3">
              <label class="italic font-semibold ml-1">Title:</label>
              <input placeholder="comment title" type="text" class="p-2 w-full ml-1 inline  rounded-md border">
            </div>
            <div class="error-form" v-html="$props.errors['commentTitle']"></div>
            <div class="flex items-center mt-1 text-left mb-2">
              <div class="w-1/2 mr-1">
                <label for="languageIsoCode" class="mr-2 font-semibold italic">Lang:</label>
                <input name="languageIsoCode" id="languageIsoCode" class="mr-2 p-2 rounded-md w-full" :value="$props.languageIsoCode" />
              </div>
              <div class="w-1/2 ml-1">
                <label for="countryIsoCode" class="mr-2 font-semibold italic">Country:</label>
                <input name="countryIsoCode" id="countryIsoCode" class="p-2 rounded-md w-full" :value="$props.countryIsoCode" />
              </div>
            </div>
            <div class="error-form" v-html="$props.errors['languageIsoCode']"></div>
            <div class="error-form" v-html="$props.errors['countryIsoCode']"></div>
            <!-- comment BREX -->
            <div class="relative text-left mb-2 mt-3">
              <label class="italic font-semibold ml-1">BREX:</label>
              <input placeholder="DMC..." type="text" class="p-2 w-full ml-1 inline  rounded-md border"
                :value="$props.brexDmRef" name="brexDmRef" dd-input="filename,path" dd-type="csdbs"
                dd-route="api.get_csdbs" dd-target="self" autocomplete="off" aria-autocomplete="none" />
            </div>
            <div class="error-form" v-html="$props.errors['brexDmRef']"></div>
            <!-- comment security class  -->
            <div class="flex items-center mb-2">
              <label for="securityClassification" class="italic font-semibold ml-1 mr-2">Security Classification:</label>
              <input name="securityClassification" id="securityClassification" placeholder="eg:. 05" :value="$props.securityClassification"
                class="w-[50px] p-2" type="number" min="1" max="5" step="1"
                onchange="if(parseInt(this.value,10)<10)this.value='0'+this.value;" />
            </div>
            <div class="error-form" v-html="$props.errors['securityClassification']"></div>
            <!-- comment type -->
            <div class="flex items-center mb-2">
              <label for="commentPriorityCode" class="italic  font-semibold ml-1 mr-2">Priority:</label>
              <select id="commentPriorityCode" name="commentPriorityCode" class="p-2 rounded-md">
                <option :selected="$props.commentPriorityCode === 'cp01' ? 'true' : 'false'" class="" value="cp01">Routine
                </option>
                <option :selected="$props.commentPriorityCode === 'cp02' ? 'true' : 'false'" class="" value="cp02">
                  Emergency</option>
                <option :selected="$props.commentPriorityCode === 'cp03' ? 'true' : 'false'" class="" value="cp03">Safety
                  critical</option>
              </select>
            </div>
            <div class="error-form" v-html="$props.errors['commentPriorityCode']"></div>
            <!-- response type -->
            <div class="flex items-center mb-2">
              <label for="responseType" class="italic  font-semibold ml-1 mr-2">Response:</label>
              <select id="responseType" name="responseType" class="p-2 rounded-md">
                <option :selected="$props.responseType === 'rt01' ? 'true' : 'false'" class="" value="rt01">Accepted
                </option>
                <option :selected="$props.responseType === 'rt02' ? 'true' : 'false'" class="" value="rt02">Pending
                </option>
                <option :selected="$props.responseType === 'rt03' ? 'true' : 'false'" class="" value="rt03">Partly
                  rejected</option>
                <option :selected="$props.responseType === 'rt04' ? 'true' : 'false'" class="" value="rt04">Rejected
                </option>
              </select>
            </div>
            <div class="error-form" v-html="$props.errors['responseType']"></div>
            <!-- commentRefs, nanti ini pakai filename sesuai route atau sesuai preview -->
            <div class="relative text-left mb-2 mt-3">
              <label for="commentRefs" class="italic  font-semibold ml-1 mr-2">Comment Refs:</label>
              <input class="block p-2 w-full ml-1 rounded-md" :value="$props.commentRefs" dd-input="filename,path"
                dd-type="csdbs" dd-route="api.get_csdbs" dd-target="self-append" name="commentRefs" />
            </div>
            <div class="error-form" v-html="$props.errors['commentRefs']"></div>
            <!-- commentRemarks -->
            <div class="relative text-left mb-2 mt-3">
              <label class="italic  font-semibold ml-1 mr-2">Remarks:</label>
              <text-editor name="commentRemarks[]" class="w-full">{{ $props.remarks }}</text-editor>
            </div>
            <div class="error-form" v-html="$props.errors['commentRemarks']"></div>
          </div>
        </div>
      </form>
    </template>
  </Property>
</template>