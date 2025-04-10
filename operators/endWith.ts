export function endWith<T>(...values: T[]) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
    flush(controller) {
      for (const value of values) {
        controller.enqueue(value);
      }
      controller.terminate();
    }
  });
} 