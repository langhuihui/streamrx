<template>
  <n-button ref="btn">{{ label }}</n-button>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { fromEvent, interval, map, switchMap, take, takeWhile } from '../../..';
const label = ref('');
const btn = ref();

const start = () => {
  label.value = '发送验证码';
  fromEvent(btn.value.$el, 'click')
    .pipeThrough(take(1))
    .pipeThrough(switchMap(() => {
      return interval(1000)
        .pipeThrough(map(x => 5 - x))
        .pipeThrough(takeWhile(x => x > 0));
    }))
    .pipeTo(
      new WritableStream({
        write(chunk) {
          label.value = chunk + "秒后重试";
          console.log(chunk);
        }
      })
    ).then(start);
};

onMounted(start);

</script>