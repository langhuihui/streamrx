export function find<T>(predicate: (item: T) => boolean) {
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (predicate(chunk)) {
        controller.enqueue(chunk);
        controller.terminate();
      }
    },
    flush(controller) {
      controller.enqueue(undefined);
      controller.terminate();
    }
  });
} 