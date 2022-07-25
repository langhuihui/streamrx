<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs

import { ref } from 'vue';
import { fromEvent, startWith, interval, switchMap, takeUntil, timer, concat, take, lazy } from '../../index';
import HelloWorld from './components/HelloWorld.vue';
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
const msg = ref("");
// const abortControl = new AbortController();
// const output = new WritableStream({
//   write(chunk: number) {
//     msg.value += chunk + "\n";
//   },
//   abort(reason: string) {
//     msg.value += reason;
//   },
//   close() {
//     msg.value += "closed";
//   }
// });
// const a = interval(500);
// setTimeout(() => {
//   a.pipeTo(output);
// }, 5000);
// fromEvent(document, "click")
//   .pipeThrough(switchMap((e: PointerEvent) => {
//     msg.value += e.offsetX + "," + e.offsetY + "\n";
//     return interval(1000).pipeThrough(startWith(-1));
//   }))
//   .pipeThrough(takeUntil(timer(5000)))
//   .pipeTo(target).catch(() => { });
// concat(interval(1000).pipeThrough(take(2)), interval(300).pipeThrough((take(5)))).pipeTo(target);
// const m = lazy(() => interval(1000)).pipeThrough(() => take(4));
// m.pipeTo(target).then(() => {
//   m.pipeTo(new WritableStream({
//     write(chunk: number) {
//       msg.value += chunk + "\n";
//     },
//     abort(reason: string) {
//       console.log(reason);
//     },
//     close() {
//       console.log("close");
//     }
//   }));
// });
</script>

<template>
  <HelloWorld />
</template>
<style>
code {
  font-size: 40px;
}
</style>