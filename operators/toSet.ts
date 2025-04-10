export function toSet<T>() {
  const set = new Set<T>();
  return new TransformStream<T, Set<T>>({
    transform(chunk) {
      set.add(chunk);
    },
    flush(controller) {
      controller.enqueue(set);
      controller.terminate();
    }
  });
} 