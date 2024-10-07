<script>
/**
 * Desktop ini dipakai untuk menampilkan localstorage key 'cached-window'
 */
export default {
  methods: {
    list() {
      const cached = JSON.parse(localStorage.getItem('cached-window'));
      const display = [];
      if(cached){
        Object.keys(cached).sort().forEach(appId => {
          display.push({
            appId: appId,
            name: cached[appId].name,
            last_saved: cached[appId].last_saved
          });
        })
        return display;
      }
    },
    open(event) {
      const evt = new Event('open-cached-window');
      evt.data = { appId: event.target.closest("*[app-id]").getAttribute('app-id') };
      document.dispatchEvent(evt)
    }
  }
}
</script>
<template>
  <div id="app-desktop relative">
    <table>
      <thead>
        <tr>
          <td>No</td>
          <td>Name</td>
          <td>Key</td>
          <td>Date</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in list()" @dblclick="open" :app-id="item.appId" class="hover:cursor-pointer">
          <td>{{i + 1}}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.key }}</td>
          <td>{{ item.last_saved }}</td>
        </tr>
      </tbody>
    </table>
    <!-- <div v-for="item in list()">
      <button :app-id="item.key" @dblclick="open">
        {{ item.name }}
      </button>
    </div> -->
  </div>
</template>