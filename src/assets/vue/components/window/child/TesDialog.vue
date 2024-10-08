<script>
import Dialog from "./Dialog.vue"
export default {
  components: {Dialog}
}
</script>

<template>
  <Dialog>
    <template #content>
      <div>foobar</div>
    </template>
  </Dialog>
</template>