export function every<T>(predicate: (item: T) => boolean) {
  return new TransformStream<T, boolean>({
    transform(chunk, controller) {
      if (!predicate(chunk)) {
        controller.enqueue(false);
        controller.terminate();
      }
    },
    flush(controller) {
      controller.enqueue(true);
    }
  });
}
 