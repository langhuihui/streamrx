export function refCount<T>() {
  let count = 0;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      count++;
      controller.enqueue(chunk);
    },
    cancel() {
      count--;
      if (count === 0) {
        this.readable.cancel();
      }
    }
  });
} 