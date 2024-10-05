import axios from "axios";
import { mainStore } from "./MainStore";

function setInterceptor(app){
  axios.defaults.baseURL = 'http://127.0.0.1:8000';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  axios.interceptors.request.use(
    async (config) => {
      if(config.useComponentLoadingProgress) mainStore().componentLoadingProgress[config.useComponentLoadingProgress] = true;
      return config;
    },
  );
  axios.interceptors.response.use(
    (response) => {
      app.config.globalProperties.$ersp.clear();
      if(response.data.errors){
        for(const key of Object.keys(response.data.errors)){
          app.config.globalProperties.$ersp.set(key, response.data.errors[key]);
        }
      }
      const e = new Event('flash');
      e.data = {
        type: response.data.infotype,
        message: response.data.message
      }
      document.dispatchEvent(e);
      if(response.config.useComponentLoadingProgress) mainStore().componentLoadingProgress[response.config.useComponentLoadingProgress] = false;
      return response;
    },
    (axiosError) => {
      if (axiosError.code && axiosError.response.data && axiosError.response.data.errors) {
        for(const key of Object.keys(axiosError.response.data.errors)){
          app.config.globalProperties.$ersp.set(key, axiosError.response.data.errors[key]);
        }
        const e = new Event('flash');
        e.data = {
          type: axiosError.response.data.infotype,
          message: `<i>${axiosError.message}</i>` + '<br/>' + axiosError.response.data.message
        }
        document.dispatchEvent(e)
      } 
      // else {
      //   console.error(axiosError.stack);
      // }
      if(axiosError.config.useComponentLoadingProgress) mainStore().componentLoadingProgress[axiosError.config.useComponentLoadingProgress] = false;
      throw axiosError;
    }
  );
}
export default setInterceptor;