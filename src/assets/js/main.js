import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import setInterceptor from './axiosInterceptor';
import axios from 'axios';
import { createPinia } from 'pinia';
import RoutesVue from './RoutesVue';
import mitt from 'mitt';
import '../css/main.css'
import Main from '../vue/Main.vue';
import { auth } from './Auth';
import { mainStore } from './MainStore';
import ContextMenu from './gui/ContextMenu';
import ErrorResponseMessage from './plugin/ErrorResponseMessage.js';
import WindowTask from './plugin/WindowTask';
import FloatMenu from './gui/FloatMenu';

window.axios = axios;
window.auth = auth;
window.mainStore = mainStore;

// create app
top.mainApp = createApp(Main);

// error response message store
mainApp.use(new ErrorResponseMessage());

setInterceptor(mainApp);

// use my window
mainApp.use(new WindowTask());
// mainApp.config.globalProperties.$windowtask = new WindowTask();

// use emitter
mainApp.config.globalProperties.emitter = mitt();

// use pinia
const pinia = createPinia();
mainApp.use(pinia);

// use router
const router = createRouter({
  routes: RoutesVue,
  history: createWebHistory(),
});
mainApp.use(router);

// use context menu
// mainApp.config.globalProperties.ContextMenu = new ContextMenu();
mainApp.config.globalProperties.FloatMenu = new FloatMenu();

// check auth
auth().check()
  .then(function(r){
    if (!r) {
      window.open("/login.html", "login", "popup,height=800,width=800,left=100");
      document.addEventListener('auth', () => {
        mainApp.mount('#app')
      });
    } else {
      mainApp.mount('#app')
    }
  }
  );

// window.main = app;


