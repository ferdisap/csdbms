<script>
import { auth } from '../../../../js/Auth';
import { openLoginPage } from '../../../../js/axiosInterceptor';
import FloatMenu from '../../menu/FloatMenu.vue';
export default {
  data() {
    return {
      isAuthenticated: false,
    }
  },
  components:{ FloatMenu },
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
          this.isAuthenticated = true;
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
    :class="[isAuthenticated ? 'bg-blue-600' : 'bg-red-600', 'relative h-6 w-6 mr-0 float-end text-center rounded-full hover:bg-gray-700 hover:cursor-pointer']">
    <span class="material-symbols-outlined text-base font-bold">account_circle</span>
  </div>
  <FloatMenu :trigger="[{ triggerId: 'auth-menu', on: 'click' }]" :use-copy-btn="false">
    <div v-if="isAuthenticated" class="list" @click="logout">
      <div>logout</div>
    </div>
    <div v-else class="list" @click="login">
      <div>login</div>
    </div>
  </FloatMenu>
</template>