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
import axios from 'axios';
// import jsCookie from 'js-cookie';

// top.jsCookie = jsCookie;

// top.installCheckbox = installCheckbox;

// top.axios = axios;
// top.auth = auth;
// top.mainStore = mainStore;

// create app
top.mainApp = createApp(Main);

mainApp.use(cache);

// error response message store
mainApp.use(new ErrorResponseMessage());

// use pinia
mainApp.use(createPinia());

setInterceptor(mainApp);

// use my window
mainApp.use(window);
// mainApp.use(new WindowTask());
// mainApp.config.globalProperties.$windowtask = new WindowTask();

// use emitter
// mainApp.config.globalProperties.emitter = mitt();

// use router
const router = createRouter({
  routes: RoutesVue,
  history: createWebHistory(),
});
mainApp.use(router);

// use context menu
// mainApp.config.globalProperties.ContextMenu = new ContextMenu();
top.FloatMenu = new FloatMenu();

// check auth
// top.axios = axios
// top.auth = auth();
mainApp.mount('#app')
// auth().check()
//   .then(function(r){
//   })
//   .catch((e) => {
//     // mainApp.mount('#app');return;
//     top.open("/login.html", "login", "popup,height=800,width=800,left=100");
//     document.addEventListener('auth', () => {
//       mainStore().isAuth = true;
//       mainApp.mount('#app');
//     }, {once:true});
//   })

// window.main = app;


