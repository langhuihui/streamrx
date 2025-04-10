export function findIndex<T>(predicate: (item: T) => boolean) {
  let index = 0;
  return new TransformStream<T, number>({
    transform(chunk, controller) {
      if (predicate(chunk)) {
        controller.enqueue(index);
        controller.terminate();
      }
      index++;
    },
    flush(controller) {
      controller.enqueue(-1);
      controller.terminate();
    }
  });
} 