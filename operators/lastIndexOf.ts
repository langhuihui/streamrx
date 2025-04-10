export function lastIndexOf<T>(searchElement: T) {
  let index = 0;
  let lastIndex = -1;
  return new TransformStream<T, number>({
    transform(chunk) {
      if (chunk === searchElement) {
        lastIndex = index;
      }
      index++;
    },
    flush(controller) {
      controller.enqueue(lastIndex);
      controller.terminate();
    }
  });
} 