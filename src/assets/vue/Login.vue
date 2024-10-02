<script>
import config from '../config.json';
import { auth } from '../js/Auth';
import { mainStore } from '../js/MainStore';
import ContinuousLoadingCircle from './components/sub/ContinuousLoadingCircle.vue';
import Flash from './components/sub/Flash.vue';

export default {
  data() {
    return {
      'mainStore': mainStore(),
      'email': '',
      'password': '',
      'componentId': 'fppas',
    }
  },
  components: { ContinuousLoadingCircle, Flash},
  methods: {
    registerURL() {
      return config.CSDB_HOST_PROD + '/login';
    },
    login() {
      auth().login(this.email, this.password, this.componentId)
        .then(r => {
          // dispatch event to parent/opener to continue process
          const event = new Event('auth');
          window.opener.document.dispatchEvent(event)
          mainStore().componentLoadingProgress[this.componentId] = false;
          if(r) window.close();
          console.log(r);
        })
        .finally(r => {
          mainStore().componentLoadingProgress[this.componentId] = false;
        })

    }
  },
  mounted(){
    window.l = this;
  }
}
</script>
<template>
  <Flash/>
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