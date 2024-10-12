import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '../vue/Login.vue';
import {logged} from '../vue/Login.vue';
import '../css/login.css'
import ErrorResponseMessage from './plugin/ErrorResponseMessage.js';
import {auth} from '../js/Auth';

const app = createApp(App);
app.use(createPinia());

app.use(new ErrorResponseMessage());

auth().check()
  .then((r)=>{
    if (r) {
      logged({authorization: auth().getAuthToken()});
    } else {
      app.mount('#app');
    }
  })



