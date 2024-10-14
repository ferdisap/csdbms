import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '../vue/Login.vue';
import {logged} from '../vue/Login.vue';
import '../css/login.css'
import ErrorResponseMessage from './plugin/ErrorResponseMessage.js';
import {auth} from '../js/Auth';

const app = createApp(App);
app.use(createPinia()); // tidak bisa mengakses pinia yang sama (top.opener.pinia) karena undefined walaupun pakai setTimeout 

app.use(new ErrorResponseMessage());

auth().check()
  .then((r)=>{
    if (r) {
      logged({authorization: auth().getAuthToken()});
    } else {
      app.mount('#app');
    }
  })




