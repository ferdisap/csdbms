import axios from "axios";
import { mainStore } from "./MainStore";
import configApp from '../config.json';
import { auth } from "./Auth";
import { dialog } from "../vue/components/window/child/Dialog.vue";

async function beforeRequest(config) {

  if(!(auth().isAuth)){
    top.newWindow = top.open("/login.html", "login", "popup,height=800,width=800,left=100");
    top.newWindow.dialog = dialog();
    const data = await top.newWindow.dialog.result();
    if(data){
      auth().isAuth = true
      auth().setAuthToken(data.token_type + " " + data.access_token);
      axios.defaults.headers.common['Authorization'] = auth().getAuthToken();
      config.headers['Authorization'] = auth().getAuthToken();
    }
  }

  if (config.useComponentLoadingProgress) mainStore().componentLoadingProgress[config.useComponentLoadingProgress] = true;
  return config;
}

function onRequestError() {
  // tbd
}

function onResponseSuccess(response) {
  this.config.globalProperties.$ersp.clear();
  if (response.data.errors) {
    for (const key of Object.keys(response.data.errors)) {
      this.config.globalProperties.$ersp.set(key, response.data.errors[key]);
    }
  }
  const e = new Event('flash');
  e.data = {
    type: response.data.infotype,
    message: response.data.message
  }
  document.dispatchEvent(e);
  if (response.config.useComponentLoadingProgress) mainStore().componentLoadingProgress[response.config.useComponentLoadingProgress] = false;
  return response;
}

function onResponseError(axiosError) {
  if (axiosError.code && axiosError.response.data && axiosError.response.data.errors) {
    for (const key of Object.keys(axiosError.response.data.errors)) {
      this.config.globalProperties.$ersp.set(key, axiosError.response.data.errors[key]);
    }
    const e = new Event('flash');
    e.data = {
      type: axiosError.response.data.infotype,
      message: `<i>${axiosError.message}</i>` + '<br/>' + axiosError.response.data.message
    }
    document.dispatchEvent(e)
  }
  if (axiosError.config.useComponentLoadingProgress) mainStore().componentLoadingProgress[axiosError.config.useComponentLoadingProgress] = false;
  throw axiosError;
}

function setInterceptor(app) {
  axios.defaults.baseURL = configApp.CSDB_HOST;
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  axios.interceptors.request.use(beforeRequest.bind(app), onRequestError.bind(app));
  axios.interceptors.response.use(onResponseSuccess.bind(app),onResponseError.bind(app));
}
export default setInterceptor;