import { createApp } from 'vue';
import setInterceptor from './axiosInterceptor';
import { createPinia } from 'pinia';
import '../css/comment.css'
import '../css/main.css'
import Main from '../vue/Main.vue';
import {createErsp} from './plugin/ErrorResponseMessage.js';  
import FloatMenu from './gui/FloatMenu';
import window from './plugin/Window';
import cache from './plugin/sub/WindowCache';
import TextEditorElement from './gui/TextEditorElement';

// dipakai untuk comment, remarks. Nanti dibuat lagi untuk xmlEditor
customElements.get('text-editor') || customElements.define('text-editor', TextEditorElement);


// create app
top.mainApp = createApp(Main);

mainApp.use(cache);

// error response message store
top.ersp = createErsp();
// mainApp.use((top.ersp));
mainApp.config.globalProperties.$ersp = top.ersp

// use pinia
// top.getPinia = () => {
//   console.log('getPinia');
//   return top.pinia;
// }
top.pinia = createPinia(); // jangan dihapus agar window bisa pakai ini
mainApp.use(top.pinia);
// top.auth = auth();
// top.mainStore = mainStore;

setInterceptor(mainApp);

// use my window
mainApp.use(window);
// mainApp.use(new WindowTask());
// mainApp.config.globalProperties.$windowtask = new WindowTask();

// use emitter
// mainApp.config.globalProperties.emitter = mitt();

// use router
// const router = createRouter({
//   routes: RoutesVue,
//   history: createWebHistory(),
// });
// mainApp.use(router);

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


