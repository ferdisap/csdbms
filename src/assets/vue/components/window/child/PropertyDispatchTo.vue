<script>
import Property from './Property.vue';
import Remarks from '../../sub/Remarks.vue';
import { addSetLogic } from '../../../../js/util/ObjectProperty';
import { installCheckbox } from '../../../../js/gui/Checkbox';
import { installDropdown } from '../../../../js/plugin/Dropdown';
import FloatMenu from '../../menu/FloatMenu.vue';
import Randomstring from 'randomstring';
import axios from 'axios';
import { formDataToObject } from '../../../../js/util/helper';
import { auth } from '../../../../js/Auth';

function style() {
  const t = ((top.innerHeight / 2) - 400); 
  const l = ((top.innerWidth / 2) - 300);
  return {
    position: 'absolute',
    width: '600px',
    height: 'auto',
    top: ((t > 0 ? t : 0) + 'px'),
    left: ((l > 0 ? l : 0) + 'px'),
    backgroundColor: '#ffffff',
  }
}
export {style}

export default {
  components: { FloatMenu, Property, Remarks },
  data() {
    return {
      auth: auth(),
      id: Randomstring.generate({charset:'alphabetic'}),
      filenames: [],
      addSearchDispatchInput: false,
    }
  },
  methods: {
    requestCsdbsByPath(path){
      axios({
        url: "/api/s1000d/all/",
        method: 'GET',
        params: {sc: "path::" + path}
      })
        .then(response => {
          for (let i = 0; i < response.data.csdbs.length; i++) {
            if(this.filenames.indexOf(response.data.csdbs[i][2]) < 0) this.filenames.push(response.data.csdbs[i][2]);
          }
        })
        .finally(() => {
          installCheckbox(this.$el.querySelector(".cb-home"))
        })
    },
    submit(event){
      axios.put("/api/s1000d/ddn/create", formDataToObject(new FormData(event.target)))
        .finally(() => {
          this.$el.dispatchEvent(new Event('close-window'));
        })
    },
    remove() {
      const cbHome = this.$el.querySelector(".cb-home");
      let values = cbHome.cbValues;
      if(!values.length) values = [cbHome.current.cbWindow.cbValue];
      values.forEach((value) => {
        let i = this.filenames.indexOf(value);
        if (i > -1) this.filenames.splice(i, 1);
      });
    },
  },
  mounted() {
    top.pdt = this;
    // this.$el.id = this.id;

    addSetLogic(top.document.getElementById(this._.appContext.app.windowId).property, 'data', (ctx, value) => {
      if (value instanceof Array) {
        // value.forEach((v) => (this.filenames.indexOf(v) < 0) ? this.filenames.push(v) : null);
        value.forEach((v) => {
          const ext = v.split('.').pop();
          // jika ext tidak ada (atau valuenya adalah path)
          if(ext === v){
            this.requestCsdbsByPath(ext);
          } else {
            if(this.filenames.indexOf(v) < 0) this.filenames.push(v);
          }
        });
        setTimeout(()=>installCheckbox(this.$el.querySelector(".cb-home")));
      }
      return value;
    });
    this.$el.querySelectorAll("*[dd-input]").forEach(el => installDropdown(el));

    this.$el.querySelector(".search-input-dispatch").addEventListener("dd-selected", (event) => {
      this.filenames.push(event.target.value);
      setTimeout(()=>installCheckbox(this.$el.querySelector(".cb-home")));
    });
  }
}
</script>
<template>
  <Property title="Dispatch To" :use-button="false">
    <template #content>
      <form :id="id" @submit.prevent="submit" class="border p-2">
        <input type="hidden" name="dispatchFromPersonEmail" :value="auth.user.email">
        <h1 class="text-center font-bold mb-2 text-lg">Create Data Dispatch Note</h1>
        <div class="w-full text-center mb-2 relative p-2">
          <div class="mb-2">
            <div class="material-symbols-outlined text-8xl">description</div>
            <div class="text-left p-1 w-full">
              <label class="mr-2 font-bold">Security Classification: </label>
              <input name="securityClassification" 
              placeholder="eg:. 05"
              class="w-[70px] p-2 border" type="number" min="1" max="5" step="1"
              value="01"
              onchange="if(parseInt(this.value,10)<10)this.value='0'+this.value;" />
            </div>
            <div class="error-form" v-html="$ersp.get('securityClassification')"></div>
            <!-- list filename to dispatch -->
            <table class="text-left cb-home mt-2 mb-4">
              <thead class="h-12">
                <tr class="cb-room">
                  <th class="w-10 border-b cb-window-all" style="display:none"><input type="checkbox"></th>
                  <th class="w-10 border-b">No</th>
                  <th class="border-b">Filename</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="( filename, i ) in  filenames " class="cb-room hover:bg-blue-300">
                  <td class="cb-window"><input type="checkbox" :value="filename"></td>
                  <td class="p-1">{{ i+1 }}</td>
                  <td class="p-1"><input name="deliveryListItemsFilename[]" type="text" :value="filename"></td>
                </tr>
              </tbody>
            </table>
            <!-- add search data module to dispatch -->
            <div v-show="addSearchDispatchInput" class="mb-2 mt-2 text-left w-full h-12">
              <input class="border p-2 w-96 search-input-dispatch" autocomplete="off" aria-autocomplete="none"
                placeholder="type filename to search"
                dd-input="filename,path" dd-target="self" dd-route="api.get_csdbs" dd-type="csdbs" />
            </div>
            <!-- Dropdown User Search -->
            <div class="mb-2 mt-2 text-left w-full h-12">
              <label class="mr-2 font-bold ">Send To: </label>
              <input name="dispatchToPersonEmail" class="border p-2 w-96" autocomplete="off"
                placeholder="type name of the target person"
                aria-autocomplete="none" dd-input="email" dd-target="self" dd-route="api.user_search_model"
                dd-type="users" />
            </div>
            <div class="error-form" v-html="$ersp.get('dispatchToPersonEmail')"></div>
            <!-- Dropdown BREX Search -->
            <div class="mb-2 mt-2 text-left w-full h-12">
              <label class="mr-2 font-bold ">Brex: </label>
              <input name="brexDmRef" class="border p-2 w-96" autocomplete="off" aria-autocomplete="none"
                placeholder="type filename to search"
                dd-input="filename,path" dd-target="self" dd-route="api.get_csdbs" dd-type="csdbs" />
            </div>
            <div class="error-form" v-html="$ersp.get('brexDmRef')"></div>
            <!-- Remarks -->
            <Remarks class-label="text-left font-bold" class="border border-gray-300 rounded-md p-2 text-left" />
            <!-- <div class="blok items-center mt-1 mb-2">
            </div> -->
            <!-- button submit -->
            <div class="w-full text-center mt-2">
              <button type="submit" class="button bg-violet-400 text-white hover:bg-violet-600">Submit</button>
            </div>
          </div>
        </div>
        <FloatMenu :trigger="[{ triggerId: id, on: 'contextmenu' }]">
          <div class="list" @click="addSearchDispatchInput = true">
            <div>add</div>
          </div>
          <div class="list" @click="remove">
            <div>remove</div>
          </div>
        </FloatMenu>
      </form>
    </template>
  </Property>
</template>