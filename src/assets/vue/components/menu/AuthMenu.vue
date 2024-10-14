<script>
import { auth } from '../../../js/Auth';
import { openLoginPage } from '../../../js/axiosInterceptor';
export default {
  data() {
    return {
      auth: auth()
    }
  },
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
          return r;
        })
    }
  },
}
</script>
<template>
  <div v-if="auth.isAuth" class="list" @click="logout">
    <div>logout</div>
  </div>
  <div v-else class="list" @click="login">
    <div>login</div>
  </div>
</template>