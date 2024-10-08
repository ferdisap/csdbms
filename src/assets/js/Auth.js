import { defineStore } from 'pinia';
// import axios from './axiosIntercepter';
import axios from 'axios';
import config from '../config.json';

axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export const auth = defineStore('auth', {
  state: () => {
    return {
      isAuth: false,
    }
  },
  actions: {
    getAuthToken() {
      const session = window.opener ? window.opener : top;
      return session.sessionStorage.getItem(config.APP_NAME + '_' + 'auth_token');
    },
    setAuthToken(value) {
      const session = window.opener ? window.opener : top;
      session.sessionStorage.setItem(config.APP_NAME + '_' + 'auth_token', value);
    },
    removeAuthToken(){
      const session = window.opener ? window.opener : top;
      session.sessionStorage.removeItem(config.APP_NAME + '_' + 'auth_token');
    },
    /**
     * authenticating user
     * @param {string} email 
     * @param {string} password 
     * @return {Promise} <rejected> AxiosError
     * @return {Promise} <fulfilled> response
     */
    async login(email, password, componentId = '') {
      const config = {
        method: 'post',
        url: "/api/login",
        data: {
          email: email,
          password: password,
        }
      };
      if(componentId) config.useComponentLoadingProgress = componentId;
      const login = await axios(config);
      if(login.status >= 200 && login.status < 300){
        this.setAuthToken("Bearer " + login.data.access_token);
      }
      return login;
    },
    /**
     * logout authenticated user
     * @return {Promise} <rejected> AxiosError
     * @return {Promise} <fulfilled> response
     */
    async logout(){
      const logout = await axios({
        method: 'post',
        url: "/api/logout",
        headers:{
          "content-type": 'application/json',
          "Authorization": this.getAuthToken()
        }
      });
      return logout;
    },
    /**
     * check wheter user is authenticated or not
     * @return {Promise} <rejected> AxiosError
     * @return {Promise} <fulfilled> response
     */
    async check() {
      if(this.isAuth){
        return Promise.resolve(true);
      }
      const check = await axios({
        method: 'post',
        url: "/api/auth-check",
        headers: {
          "content-type": 'application/json',
          "Authorization": this.getAuthToken()
        }
      });
      if (check.status === 200) {
        this.isAuth = true;
      }
      return check;
    }
  }
});