export function toArray<T>() {
  const array: T[] = [];
  return new TransformStream<T, T[]>({
    transform(chunk) {
      array.push(chunk);
    },
    flush(controller) {
      controller.enqueue(array);
      controller.terminate();
    }
  });
} 