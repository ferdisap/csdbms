import axios from "axios";
import { mainStore } from "./MainStore";
import configApp from '../config.json';
import { auth, promiseState } from "./Auth";
import { dialog } from "../vue/components/window/child/Dialog.vue";

function openLoginPage() {
  top.newWindow = top.open("/login.html", "login", "popup,height=800,width=800,left=100");
  top.newWindow.dialog = dialog();
  return top.newWindow.dialog.result()
  .then((data) => {
    auth().setAuthToken(data.token_type + " " + data.access_token);
    axios.defaults.headers.common['Authorization'] = auth().getAuthToken();
    auth().requestChecking();
    return data;
  })
}

export {openLoginPage}

async function beforeRequest(config) {

  if (await promiseState(auth().isAuth) !== "<fulfilled>: true") {
    if(await openLoginPage()){
      config.headers['Authorization'] = auth().getAuthToken();
    }
  }
  return config;
}

function onRequestError() {
  // tbd
}

function onResponseSuccess(response) {
  top.ersp.clear();
  if (response.data.errors) {
    for (const key of Object.keys(response.data.errors)) {
      top.ersp.set(key, response.data.errors[key]);
    }
  }
  const e = new Event('flash');
  e.data = {
    type: response.data.infotype,
    message: response.data.message
  }
  if (response.data.errors) e.data.errors = response.data.errors;
  document.dispatchEvent(e);
  return response;
}

function onResponseError(axiosError) {
  if (axiosError.code && axiosError.response.data && axiosError.response.data.errors) {
    for (const key of Object.keys(axiosError.response.data.errors)) {
      top.ersp.set(key, axiosError.response.data.errors[key]);
    }
    const e = new Event('flash');
    e.data = {
      type: axiosError.response.data.infotype,
      message: `<i>${axiosError.message}</i>` + '<br/>' + axiosError.response.data.message,
      errors: axiosError.response.data.errors,
    }
    document.dispatchEvent(e)
  }
  throw axiosError;
}

function setInterceptor(app) {
  axios.defaults.baseURL = configApp.CSDB_HOST;
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  axios.interceptors.request.use(beforeRequest.bind(app), onRequestError.bind(app));
  axios.interceptors.response.use(onResponseSuccess.bind(app), onResponseError.bind(app));
}
export default setInterceptor;