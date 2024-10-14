import { defineStore } from 'pinia';
import config from '../config.json';
import jsCookie from 'js-cookie';

/**
 * src = https://stackoverflow.com/questions/30564053/how-can-i-synchronously-determine-a-javascript-promises-state
 * 
 * EXAMPLE:
 * const authenticating = isAuth();
 * let status = await promiseState(authenticating.result());
 * console.log(status); // <pending>
 * authenticating.state(true);
 * status = await promiseState(authenticating.result());
 * console.log(status); // "<fulfilled>: true" or "<fulfilled>: false"
 * 
 * @param {Promise} p 
 * @returns 
 */
function promiseState(p) {
  const t = {};
  return Promise.race([p, t])
    .then(v => (v === t) ? "<pending>" : "<fulfilled>: " + v, () => "<rejected>");
}
export { promiseState };

const isAuth = () => {
  let resolve;
  const promise = new Promise(r => resolve = r);
  const state = (state) => resolve(state ? true : false);
  const result = () => promise;
  return { state, result };
}
let authenticating = isAuth();

export const auth = defineStore('auth', {
  state: () => {
    return {
      /**
       * Promise <fulfilled> true/false
       */
      isAuth: authenticating.result(),
    }
  },
  actions: {
    /**
     * @returns {string}
     * @returns {null}
     */
    getAuthToken() {
      const authorization = jsCookie.get(config.APP_NAME + '_' + 'auth_token');
      if (authorization) return authorization;

      const session = window.opener ? window.opener : top;
      return session.sessionStorage.getItem(config.APP_NAME + '_' + 'auth_token');
    },
    /**
     * @param {string} value 
     * @param {boolean} useCookie 
     * @returns undefined
     */
    setAuthToken(value, useCookie = false) {
      if (useCookie) {
        jsCookie.set(config.APP_NAME + '_' + 'auth_token', value)
        //jsCookie.set(config.APP_NAME + '_' + 'auth_token', value, {expired: 7}) // expires 7 day
        return;
      }
      const authorization = jsCookie.get(config.APP_NAME + '_' + 'auth_token');
      if (authorization) return authorization;

      const session = window.opener ? window.opener : top;
      session.sessionStorage.setItem(config.APP_NAME + '_' + 'auth_token', value);
    },
    /**
     * @returns {undefined}
     */
    removeAuthToken() {
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
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      };
      const login = await fetch(config.CSDB_HOST + "/api/login", configFetch);
      const data = await login.json();
      if (login.ok) {
        this.setAuthToken("Bearer " + data.access_token, remember);
        // this.isAuth = true;
        authenticating.state(true);
        return Promise.resolve(data);
      }
      return Promise.reject(data);
    },
    /**
     * logout authenticated user
     * @return {Promise} <fulfilled>/<rejected>
     */
    async logout() {
      const logout = await fetch(config.CSDB_HOST + "/api/logout", {
        method: 'post',
        headers: {
          "content-type": 'application/json',
          "X-Requested-With": "XMLHttpRequest",
          "Authorization": this.getAuthToken()
        }
      });
      const data = await logout.json();
      if (logout.ok) {
        this.setAuthToken('');
        authenticating.state(false);
        //reset isAuth
        authenticating = isAuth();
        this.isAuth = authenticating.result();

        return Promise.resolve(data);
      }
      return Promise.reject(data);
    },
    /**
     * check wheter user is authenticated or not
     * @return {Promise} true/false
     */
    async check() {
      const state = promiseState(this.isAuth);
      switch (state) {
        case '<fulfilled>: true': return true;
        case '<fulfilled>: false': return false;
        case '<pending>': return await this.isAuth;      
        default: return this.requestChecking(); // ga mungkin ini dijalankan jika tidak ada fungsi reject() di authenticating
      }
    },

    /**
     * check ke server jika masih pending atau reject
     * @returns {Promise} true/false
     */
    async requestChecking() {
      const state = promiseState(this.isAuth);
      let check;
      switch (state) {
        case '<fulfilled>: true':
          return true;
        default:
          check = await fetch(config.CSDB_HOST + "/api/auth-check", {
            method: 'POST',
            headers: {
              "content-type": 'application/json',
              "X-Requested-With": "XMLHttpRequest",
              "Authorization": this.getAuthToken()
            }
          });
          break;
      }
      if (check.ok) {
        authenticating.state(true);
        return true;
      } else {
        return false;
      }
    }
  }
});