<script>
import { auth } from '../../../../js/Auth';
import { openLoginPage } from '../../../../js/axiosInterceptor';
import FloatMenu from '../../menu/FloatMenu.vue';
export default {
  data() {
    return {
      isAuthenticated: false,
      auth: auth(),
    }
  },
  components: { FloatMenu },
  methods: {
    logout() {
      auth().logout()
        .then(() => {
          const e = new Event('new-window');
          e.data = {
            alert: {
              props: {
                title: "Login Status",
                type: "note",
                instruction: "You are logged out!"
              }
            }
          }
          top.dispatchEvent(e);
          this.isAuthenticated = false;
        })
    },
    login() {
      openLoginPage()
        .then(r => {
          const e = new Event('new-window');
          e.data = {
            alert: {
              props: {
                title: "Login Status",
                type: r ? "note" : "caution",
                instruction: "You are " + (r ? '' : 'not ') + "logged in!"
              }
            }
          }
          top.dispatchEvent(e);
          this.isAuthenticated = r;
          return r;
        })
    }
  },
  mounted() {
    top.auth = auth();
    auth().check()
      .then(r => {
        this.isAuthenticated = r;
      })
    this.$el.addEventListener('authenticated', () => this.isAuthenticated = true)
  }
}
</script>
<template>
  <div id="auth-menu"
    :class="[isAuthenticated ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700', 'relative h-6 w-6 mr-0 float-end text-center rounded-full hover:cursor-pointer']">
    <span class="material-symbols-outlined text-base font-bold">account_circle</span>
  </div>
  <FloatMenu :trigger="[{ triggerId: 'auth-menu', on: 'click' }]" :use-copy-btn="false">
    <div class="flex items-center justify-start">
      <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#F9DB78">
        <path
          d="M222-255q63-40 124.5-60.5T480-336q72 0 134 20.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm-.21 370q-83.15 0-156.28-31.5t-127.22-86Q142-252 111-324.84 80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.5t-127.13 86Q562.74-80 479.6-80Z" />
      </svg>
      <div class="ml-2" v-if="auth.user">
        <div>{{ auth.user.first_name + ' ' + (auth.user.middle_name ?? '') + ' ' + (auth.user.last_name ?? '')}}</div>
        <div class="text-sm italic">{{ auth.user.email }}</div>
        <div class="text-sm">{{ auth.user.job_title }}</div>
      </div>
    </div>
    <div v-if="isAuthenticated" class="list" @click="logout">
      <div>logout</div>
    </div>
    <div v-else class="list" @click="login">
      <div>login</div>
    </div>
</FloatMenu></template>