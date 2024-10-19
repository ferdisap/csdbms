<script>
import WindowMove from '../../../js/plugin/sub/WindowMove'
import FloatMenu from '../menu/FloatMenu.vue';
import { installCheckbox, cancel, select } from "../../../js/gui/Checkbox"

function openWindow(data) {
  const evt = new Event('open-cached-window');
  evt.data = data;
  document.dispatchEvent(evt)
}

/**
 * Desktop ini dipakai untuk menampilkan localstorage key 'cached-window'
 */
export default {
  data() {
    return {
      cachedWindow: {
        zIndex: [],
        list: {}
      }
    }
  },
  components: { FloatMenu },
  methods: {
    updateList() {
      const cached = JSON.parse(localStorage.getItem('cached-window'));
      const display = [];
      if (cached) {
        Object.keys(cached).sort().forEach(appId => {
          display.push({
            appId: appId,
            name: cached[appId].name,
            last_saved: cached[appId].last_saved
          });
        })
        this.cachedWindow.list = display;
      }
      setTimeout(() => {
        installCheckbox(document.getElementById('desktop-cb'));
      }, 0)
    },
    open() {
      openWindow({ appId: document.getElementById("desktop-cb").current.cbWindow.cbValue });
    },
    setToTop(event) {
      const windowEl = event.target;
      this.cachedWindow.zIndex[this.cachedWindow.zIndex.indexOf(windowEl.id)] = undefined;
      this.cachedWindow.zIndex.push(windowEl.id);
      if (this.cachedWindow.zIndex.length > 20) this.cachedWindow.zIndex = this.cachedWindow.zIndex.filter(v => v);
      windowEl.style.zIndex = (this.cachedWindow.zIndex.length) + 60; // kasi 60 karena window itu minimal zIndex 80
    },
    enableMove(trigger) {
      const wmove = new WindowMove();
      wmove.persistenSize = true;
      wmove.attach(trigger, null, null, trigger.parentElement)
    },
    remove() {
      const cbHome = document.getElementById("desktop-cb");
      let appIds = cbHome.cbValues;
      if(!appIds.length){
        if (cbHome.current.cbWindow) appIds = [cbHome.current.cbWindow.cbValue];
        else return;
      }
      const cached = JSON.parse(localStorage.getItem('cached-window'));
      appIds.forEach(id => delete cached[id]);
      localStorage.setItem('cached-window', JSON.stringify(cached));
      this.updateList();
    },
    cancel: cancel,
    select: select,
  },
  beforeMount() {
    this.updateList();
  },
  mounted() {
    this.enableMove(document.getElementById('title-cached-window'));

    const url = new URL(top.location);
    if (url.searchParams.has('id')) openWindow({appId: url.searchParams.get('id')});
  }
}
</script>

<template>
  <div id="app-desktop" class="relative">
    <div class="h-96 w-fit absolute bg-white shadow-md overflow-auto" id="cached-window-list" @click="setToTop">
      <div id="title-cached-window" class="bg-blue-500">Saved Window <button @click="updateList"
          class="material-symbols-outlined float-end text-base mx-2">replay</button></div>
      <div class="p-2">
        <table id="desktop-cb" class="cb-home">
          <thead>
            <tr class="cb-room">
              <th style="display:none" class="cb-window-all"><input type="checkbox"></th>
              <th>No</th>
              <th>Name</th>
              <th>Key</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody id="title-cached-window-body">
            <tr v-for="(item, i) in cachedWindow.list" @dblclick="open" class="cb-room">
              <td style="display:none" class="cb-window"><input type="checkbox" :value="item.appId"></td>
              <td>{{ i + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.appId }}</td>
              <td>{{ item.last_saved }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <FloatMenu :trigger="[{ triggerId: 'app-desktop', on: 'contextmenu' }]">
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

<style scoped>
#app-desktop th {
  font-weight: bold;
  font-size: 1rem;
  /* text-base */
  line-height: 1.5 rem;
  /* text-base */
}

#title-cached-window {
  height: 2rem;
  /* h-8 */
  text-align: center;
  font-weight: bold;
  color: white;
  padding-top: 0.25rem;
  /* py-1 */
  padding-bottom: 0.25rem;
  /* py-1 */
}

table {
  margin-top: 0.25rem;
  /* mt-1 */
}

table td,
table th {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  border: 1px dashed gray;
  font-size: 1rem;
  /* text-base */
  line-height: 1.5 rem;
  /* text-base */
}

tr:hover {
  cursor: pointer;
}
</style>