```ts
import { interval, takeWhile, map } from 'streamrx';

interval(1000)
  .pipeThrough(map(x => 10 - x))
  .pipeThrough(takeWhile(x => x > 0))
  .pipeTo(new WritableStream({
      write(chunk) {
        console.log(chunk);
      }
}));
```