import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import setInterceptor from './axiosInterceptor';
import { createPinia } from 'pinia';
import RoutesVue from './RoutesVue';
import mitt from 'mitt';
import '../css/main.css'
import Main from '../vue/Main.vue';
import { auth } from './Auth';
import { mainStore } from './MainStore';
import ErrorResponseMessage from './plugin/ErrorResponseMessage.js';  
import FloatMenu from './gui/FloatMenu';
import window from './plugin/Window';
import cache from './plugin/sub/WindowCache';
import { installCheckbox } from './gui/Checkbox';

top.installCheckbox = installCheckbox;

// top.axios = axios;
// top.auth = auth;
// top.mainStore = mainStore;

// create app
top.mainApp = createApp(Main);

mainApp.use(cache);

// error response message store
mainApp.use(new ErrorResponseMessage());

setInterceptor(mainApp);

// use my window
mainApp.use(window);
// mainApp.use(new WindowTask());
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
    mainApp.mount('#app')
  })
  .catch((e) => {
    mainApp.mount('#app');return;
    top.open("/login.html", "login", "popup,height=800,width=800,left=100");
    document.addEventListener('auth', () => {
      mainStore().isAuth = true;
      mainApp.mount('#app');
    }, {once:true});
  })

// window.main = app;


