import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import setInterceptor from './axiosInterceptor.js';
import App from '../vue/Login.vue';
import '../css/login.css'
import ErrorResponseMessage from './plugin/ErrorResponseMessage.js';

// window.mainStore = mainStore; 
// window.auth = auth();
// window.axios = axios;
// window.mitt = mitt;

axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

app.use(new ErrorResponseMessage());

window.app = app;

setInterceptor(app);
app.mount('#app');

