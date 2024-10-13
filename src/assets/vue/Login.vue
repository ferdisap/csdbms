<script>
import config from '../config.json';
import { auth } from '../js/Auth';
import ContinuousLoadingCircle from './components/sub/ContinuousLoadingCircle.vue';
import Flash from './components/sub/Flash.vue';

const logged = function(data) {
  if (window.dialog && window.dialog.yes) {
    window.dialog.yes(data);
  }
  window.close();
}
export {logged};

export default {
  data() {
    return {
      'email': '',
      'password': '',
      'componentId': 'fppas',
      'rememberMe': false,
    }
  },
  components: { ContinuousLoadingCircle, Flash },
  methods: {
    registerURL() {
      return config.CSDB_HOST_PROD + '/login';
    },
    login() {
      this.$emit('clp',true);
      auth().login(this.email, this.password, this.componentId, this.rememberMe)
        .then(data => {
          // top.data = data;
          logged(data);
        })
        .catch(data => {
          this.$ersp.newError(data.errors);
          const e = new Event('flash');
          e.data = {
            type: data.infotype,
            message: data.message,
            errors: data.errors
          }
          document.dispatchEvent(e);
        })
        .finally(r => {
          this.$emit('clp',false);
        })

    }
  },
  async mounted() {
    window.l = this;
    // window.auth = auth();
    // top.jsCookie = jsCookie;
  }
}
</script>
<template>
  <Flash />
  <div class="w-[100vw] h-[100vh]">
    <form @submit.prevent="login">

      <div class="absolute min-w-96 max-w-3xl left-1/3 h-1/3 top-1/4">

        <div
          class="h-14 flex items-center justify-center shadow-md bg-blue-500 text-white font-bold tracking-widest text-2xl">
          Login</div>

        <div class="mt-8 mx-3">
          <div class="p-2 border  shadow-sm">
            <div class="text-sm text-gray-400">Email</div>
            <input v-model="email" placeholder="eg.: luffy@example.com" type="email" class="w-full outline-none" />
          </div>
          <div class="error-form" v-html="$ersp.get('email')"></div>

          <div class="p-2 border  mt-3 shadow-sm">
            <div class="text-sm text-gray-400">Password</div>
            <input v-model="password" placeholder="eg.: password" type="password" class="w-full outline-none" />
          </div>
          <div class="error-form" v-html="$ersp.get('password')"></div>
        </div>

        <div class="mr-3 mt-2 flex items-center justify-end space-x-2">
          <button type="button" tabindex="-1" @click.stop.prevent="rememberMe = !rememberMe"
            class="italic font-thin">remember me</button>
          <input type="checkbox" :checked="rememberMe">
        </div>

        <div class="p-2 w-full mt-2 px-4">
          <span class="float-start italic">don't have account? Register
            <a :href="registerURL()" class="">here</a>
          </span>
          <button type="submit" class="button-login float-end">Submit</button>
        </div>
      </div>
    </form>

    <ContinuousLoadingCircle />
  </div>
</template>