export function some<T>(predicate: (item: T) => boolean) {
  return new TransformStream<T, boolean>({
    transform(chunk, controller) {
      if (predicate(chunk)) {
        controller.enqueue(true);
        controller.terminate();
      }
    },
    flush(controller) {
      controller.enqueue(false);
      controller.terminate();
    }
  });
} 