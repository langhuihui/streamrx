export function indexOf<T>(searchElement: T) {
  let index = 0;
  return new TransformStream<T, number>({
    transform(chunk, controller) {
      if (chunk === searchElement) {
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