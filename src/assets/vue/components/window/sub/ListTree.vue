<script>
import ContinuousLoadingCircle from '../../sub/ContinuousLoadingCircle.vue';
import WorkerListTree from '../../../../js/worker/ListTree.js?worker'
import config from '../../../../config.json';
import { auth, promiseState } from '../../../../js/Auth';
import { isProxy, toRaw } from 'vue';
import { installCheckbox, cancel, select } from '../../../../js/gui/Checkbox';
import FloatMenu from '../../menu/FloatMenu.vue';
import Randomstring from 'randomstring';
import { isArray } from '../../../../js/util/helper';
import { getCsdbData } from '../../../../js/util/S1000DHelper.js'

async function fetchList() {
  if (promiseState(auth().isAuth) !== "<fulfilled>: true") {
    await auth().isAuth;
  }
  const worker = new WorkerListTree;
  worker.onmessage = (e) => {
    // this.data.level = e.data[1];
    // this.data.list = e.data[0];
    createListTreeHTML.call(this, e.data[0],e.data[1],this.$props.open)

    worker.terminate();
  }
  this.clp(true);
  const headers = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Authorization": auth().getAuthToken(),
  };
  worker.postMessage({
    mode: 'fetchData',
    data: [
      {
        route: {
          method: 'GET',
          url: config.CSDB_HOST + '/api/s1000d/csdb/all',
          headers: headers
        }
      },
      {
        route: {
          method: 'GET',
          url: config.CSDB_HOST + '/api/s1000d/csdb/dispatched',
          headers: headers
        }
      },
    ]
  })
}

function render(stringhtml) {
  const container = this.$el.querySelector(".listtree-tree");
  container.innerHTML = stringhtml;
  installCheckbox(container);

  // open/close details
  container.querySelectorAll("*[expand-collapse-btn]").forEach(el => {
    el.component = new WeakRef(this);
    if (!el.expandCollapseListener) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        const path = this.getAttribute('expand-collapse-btn');
        const details = this.closest('details');
        details.open = !details.open;
        // set icon
        details.firstElementChild.firstElementChild.innerHTML = details.open ? 'keyboard_arrow_down' : 'chevron_right'
        if (!this.component.deref().$data.open) {
          const expandCollapseListTreeFromLocalStorage = top.sessionStorage.getItem("listtree:"+ window.location.pathname + window.location.search);
          if (expandCollapseListTreeFromLocalStorage) {
            this.component.deref().$data.open = JSON.parse(expandCollapseListTreeFromLocalStorage)
          } else {
            this.component.deref().$data.open = {};
          }
        }
        this.component.deref().$data.open[path] = details.open;
        top.sessionStorage.setItem("listtree:" + window.location.pathname + window.location.search, JSON.stringify(this.component.deref().$data.open))
      }.bind(el))
      el.expandCollapseListener = true;
    }
  })

  // onclick folder
  container.querySelectorAll("summary > .folder").forEach(el => {
    if (!el.clickFolderListener) {
      // add here listener
      el.addEventListener('click',() => {
        // this.closest(".listtree").__vnode.ctx.emit('clickFolder', el.closest(".cb-room").getAttribute('path'));
        this.$emit('clickFolder', el.closest(".cb-room").getAttribute('path'));
      })
      el.clickFolderListener = true
    }
  })
  // onclick filename
  container.querySelectorAll("details .filename").forEach(el => {
    if (!el.clickFilenameListener) {
      // add here listener
      // el.addEventListener('click',() => console.log('click Filename: ', el.closest(".cb-room").cbWindow.cbValue), getCsdbData(el.closest(".cb-room").cbWindow.cbValue))
      el.addEventListener('click', () => {
        // this.closest(".listtree").__vnode.ctx.emit('clickFilename', el.closest(".cb-room").cbWindow.cbValue);
        this.$emit('clickFilename', el.closest(".cb-room").cbWindow.cbValue);
      });
      el.clickFilenameListener = true
    }
  })
}

function createListTreeHTML(list, level,open) {
  const hrefForPdf = '#';
  const hrefForHtml = '#';
  const hrefForOther = '#';
  const worker = new WorkerListTree;
  worker.onmessage = (e) => {
    render.call(this, e.data);
    this.clp(false);
    worker.terminate();
  };
  worker.postMessage({
    mode: 'createHTMLString',
    data: {
      start_l: 1,
      list_level: level,
      list: list,
      open: open,
      hrefForPdf: hrefForPdf,
      hrefForHtml: hrefForHtml,
      hrefForOther: hrefForOther,
    }
  });
}

async function start() {
  // this.data = new Proxy({}, {
  //   set: (t, k, v) => {
  //     // t[k] = v;
  //     // if (k === 'list') {
  //       // setTimeout(createListTreeHTML.apply(this));
  //     // };
  //     console.log(v);
  //     setTimeout(createListTreeHTML.apply(this, v, this._.props.open));
  //     return true;
  //   }
  // });
  this._.props.open = JSON.parse(top.sessionStorage.getItem("listtree:" + window.location.pathname + window.location.search));
  fetchList.apply(this);
}

// ############

export default {
  components: { ContinuousLoadingCircle, FloatMenu },
  data() {
    return {
      data: {},
      html: '',
      componentId: Randomstring.generate({ charset: 'alphabetic' }),
    }
  },
  props: {
    open: {
      type: Object,
      default: {},
    },
  },
  emits:['clickFilename', 'clickFolder'],
  methods: {
    /*
    * akan mendelete jika newModel tidak ada
    * @returns {Object} csdbs 
    */
    deleteList(filename) {
      let csdb;
      Object.entries(this.data.list).find(arr => {
        const find = arr[1].find(v => v.filename === filename);
        if (find) {
          const index = arr[1].indexOf(find);
          this.data.list[arr[0]].splice(index, 1);
        }
        return csdb = find;
      }); // ini akan mereturn Array: index#0 path, index#1 Array berisi csdb object
      return csdb;
    },
    /**
     * digunakan untuk emit.on('ListTree-refresh')
     */
    refresh() {
      fetchList.apply(this);
    },
    clickFolder(data) {
      console.log('click folder', data);
      this.$emit('clickFolder', )
    },
    clickFilename(data) {
      console.log('click filename', data);
    },
    cancel: cancel,
    select: select,
  },
  computed: {
    listobject() {
      return this.data.list ?? {};
    },
    pageless() {
      return this.paginationInfo['current_page'] > 1 ? this.paginationInfo['current_page'] - 1 : 1;
    },
    pagemore() {
      return (this.paginationInfo['current_page'] < this.paginationInfo['last_page']) ? this.paginationInfo['current_page'] + 1 : this.paginationInfo['last_page']
    },
    level() {
      return this.data.level ?? {}
    },
  },
  async mounted() {
    top.lt = this;
    start.apply(this);
  },
}
</script>

<template>
  <div :id="componentId" class="listtree">
    <div class="listtree-list">
      <div class="listtree-tree"></div>
    </div>
    <FloatMenu :trigger="[{ triggerId: componentId, on: 'contextmenu' }]">
      <div class="list" @click="select">
        <div>select</div>
      </div>
      <div class="list" @click="refresh()">
        <div>refresh</div>
      </div>
      <div class="list" @click="cancel">
        <div>cancel</div>
      </div>
    </FloatMenu>
    <ContinuousLoadingCircle />
  </div>
</template>