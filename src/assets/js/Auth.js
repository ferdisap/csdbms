import { defineStore } from 'pinia';
import config from '../config.json';
import jsCookie from 'js-cookie';

export const auth = defineStore('auth', {
  state: () => {
    return {
      isAuth: false,
    }
  },
  actions: {
    /**
     * @returns {string}
     * @returns {null}
     */
    getAuthToken() {
      const authorization = jsCookie.get(config.APP_NAME + '_' + 'auth_token');
      if(authorization) return authorization;

      const session = window.opener ? window.opener : top;
      return session.sessionStorage.getItem(config.APP_NAME + '_' + 'auth_token');
    },
    /**
     * @param {string} value 
     * @param {boolean} useCookie 
     * @returns undefined
     */
    setAuthToken(value, useCookie = false) {
      if(useCookie){
        jsCookie.set(config.APP_NAME + '_' + 'auth_token', value)
        return;
      }
      const authorization = jsCookie.get(config.APP_NAME + '_' + 'auth_token');
      if(authorization) return authorization;

      const session = window.opener ? window.opener : top;
      session.sessionStorage.setItem(config.APP_NAME + '_' + 'auth_token', value);
    },
    /**
     * @returns {undefined}
     */
    removeAuthToken(){
      jsCookie.remove(config.APP_NAME + '_' + 'auth_token');
      const session = window.opener ? window.opener : top;
      session.sessionStorage.removeItem(config.APP_NAME + '_' + 'auth_token');
    },
    /**
     * authenticating user
     * @param {string} email 
     * @param {string} password
     * @return {Promise} <fulfilled>/<rejected>
     */
    async login(email, password, remember) {
      const configFetch = {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password
        }),
        headers:{
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      };
      const login = await fetch(config.CSDB_HOST + "/api/login", configFetch);
      const data = await login.json();
      if(login.ok){
        this.setAuthToken("Bearer " + data.access_token, remember);
        this.isAuth = true;
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    },
    /**
     * logout authenticated user
     * @return {Promise} <fulfilled>/<rejected>
     */
    async logout(){
      const logout = await fetch(config.CSDB_HOST + "/api/logout", {
        method: 'post',
        headers:{
          "content-type": 'application/json',
          "X-Requested-With": "XMLHttpRequest",
          "Authorization": this.getAuthToken()
        }
      });
      const data = await login.json();
      if(logout.ok){
        this.setAuthToken('');
        this.isAuth = false;
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    },
    /**
     * check wheter user is authenticated or not
     * @return {Promise} true/false
     */
    async check() {
      if(this.isAuth){
        return Promise.resolve(true);
      }
      const check = await fetch(config.CSDB_HOST + "/api/auth-check", {
        method: 'POST',
        headers: {
          "content-type": 'application/json',
          "X-Requested-With": "XMLHttpRequest",
          "Authorization": this.getAuthToken()
        }
      });
      top.check = check;
      if (check.ok) {
        this.isAuth = true;
      } else {
        this.isAuth = false;
      }
      return Promise.resolve(this.isAuth);
    }
  }
});