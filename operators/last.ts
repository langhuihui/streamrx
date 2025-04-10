export function last<T>(predicate?: (item: T) => boolean) {
  let lastValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk) {
      if (!predicate || predicate(chunk)) {
        lastValue = chunk;
      }
    },
    flush(controller) {
      controller.enqueue(lastValue);
      controller.terminate();
    }
  });
} 