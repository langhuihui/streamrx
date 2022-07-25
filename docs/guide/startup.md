# startup

Implementing RxJs with Streams API

[what is Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)

## install

npm
```
npm i streamrx
```
yarn
```
yarn add streamrx
```
pnpm
```
pnpm i streamrx
```

## usage

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