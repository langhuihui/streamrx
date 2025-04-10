export function count<T>(predicate?: (item: T) => boolean) {
  let count = 0;
  return new TransformStream<T, number>({
    transform(chunk) {
      if (!predicate || predicate(chunk)) {
        count++;
      }
    },
    flush(controller) {
      controller.enqueue(count);
      controller.terminate();
    }
  });
} 