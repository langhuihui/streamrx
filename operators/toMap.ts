export function toMap<T, K, V>(keySelector: (item: T) => K, valueSelector: (item: T) => V) {
  const map = new Map<K, V>();
  return new TransformStream<T, Map<K, V>>({
    transform(chunk) {
      map.set(keySelector(chunk), valueSelector(chunk));
    },
    flush(controller) {
      controller.enqueue(map);
      controller.terminate();
    }
  });
} 