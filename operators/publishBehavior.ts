export function publishBehavior<T>(initialValue: T) {
  return new TransformStream<T, T>({
    start(controller) {
      controller.enqueue(initialValue);
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
    }
  });
} 