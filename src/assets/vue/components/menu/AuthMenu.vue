<script>
import { auth } from '../../../js/Auth';
export default {
  data() {
    return {
      auth: auth()
    }
  },
}
</script>
<template>
  <div v-if="auth.isAuth" class="list">
    <div>logout</div>
  </div>
  <div v-else class="list">
    <div>login</div>
  </div>
</template>