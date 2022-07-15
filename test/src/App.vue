<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs

import { ref } from 'vue';
import { fromEvent, startWith, interval, switchMap, takeUntil, timer } from '../..';
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
const msg = ref("");
const abortControl = new AbortController();
const target = new WritableStream({
  write(chunk: number) {
    msg.value += chunk + "\n";

  },
  abort(reason: string) {
    console.log(reason);
  },
  close() {
    console.log("close");
  }
});
fromEvent(document, "click")
  .pipeThrough(switchMap((e: PointerEvent) => {
    msg.value += e.offsetX + "," + e.offsetY + "\n";
    return interval(1000).pipeThrough(startWith(-1));
  }))
  .pipeThrough(takeUntil(timer(5000)))
  .pipeTo(target).catch(() => { });
</script>

<template>
  <div>
    <pre>
      <code>
  {{ msg }}
      </code>
    </pre>
  </div>
</template>