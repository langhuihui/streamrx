export function startWith<T>(...values: T[]) {
  return new TransformStream<T, T>({
    start(controller) {
      for (const value of values) {
        controller.enqueue(value);
      }
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
    }
  });
} 