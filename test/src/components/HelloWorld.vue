<script setup lang="ts">
import { ref } from 'vue';
import { interval, takeWhile, map } from '../../..';
const msg = ref("hello world\n");
const createWS = <T>() => new WritableStream<T>({
  write(chunk: T) {
    msg.value += chunk + "\n";
  }
});
interval(1000)
  .pipeThrough(map(x => 10 - x))
  .pipeThrough(takeWhile(x => x > 0))
  .pipeTo(createWS()).then(() => {
    msg.value="complete"
  });
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