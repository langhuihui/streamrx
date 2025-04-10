export function toObject<T, K extends string | number, V>(keySelector: (item: T) => K, valueSelector: (item: T) => V) {
  const obj: Record<K, V> = {} as Record<K, V>;
  return new TransformStream<T, Record<K, V>>({
    transform(chunk) {
      obj[keySelector(chunk)] = valueSelector(chunk);
    },
    flush(controller) {
      controller.enqueue(obj);
      controller.terminate();
    }
  });
} 