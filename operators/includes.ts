export function includes<T>(searchElement: T) {
  return new TransformStream<T, boolean>({
    transform(chunk, controller) {
      if (chunk === searchElement) {
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