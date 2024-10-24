<script>
export default {
  data() {
    return {
      time: "00:00",
      day: 'Thursday, Oct 24, 2024'
    }
  },
  methods: {
    updateDate() {
      const date = new Date();
      const hour = date.getHours().toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
      const minutes = date.getMinutes().toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
      this.time = hour + ":" + minutes;
      this.day = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        day: 'numeric',
        month: 'short'
      })
    }
  },
  mounted() {
    this.updateDate()
    setInterval(this.updateDate,60000)
  }
}
</script>
<template>
  <div class="w-full text-center fixed bottom-44">
    <span class="block text-9xl font-bold text-gray-200" style="text-shadow: -1px -2px 0 #fff, 1px -2px 0 #fff, -1px 2px 0 #fff, 1px 2px 0 #fff;">{{ time }}</span>
    <span class="block text-3xl font-thin text-gray-200" style="text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">{{ day }}</span>
  </div>
</template>