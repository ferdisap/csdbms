<script>
import {reactive} from 'vue';

function getDate() {
  const date = new Date();
  const hour = date.getHours().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
  const minutes = date.getMinutes().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
  return {
    time: hour + ":" + minutes,
    day: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      day: 'numeric',
      month: 'short'
    })
  }
}

if (!top.date) {
  top.date = reactive(getDate());  
  setInterval(() => {
    const d = getDate();
    top.date.time = d.time;
    top.date.day = d.day;
  }, 60000)
}

export default {
  computed:{
    time(){
      return top.date.time;
    },
    day(){
      return top.date.day;
    },
  },
}
</script>
<template>
  <div class="w-full text-center fixed bottom-44">
    <span class="block text-9xl font-bold text-gray-200" style="text-shadow: -1px -2px 0 #fff, 1px -2px 0 #fff, -1px 2px 0 #fff, 1px 2px 0 #fff;" v-html="time"></span>
    <span class="block text-3xl font-thin text-gray-200" style="text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;" v-html="day"></span>
  </div>
</template>