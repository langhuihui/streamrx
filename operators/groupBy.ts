export function groupBy<T, K>(
  keySelector: (value: T) => K
) {
  const groups = new Map<K, T[]>();
  return new TransformStream<T, [K, T[]]>({
    transform(chunk, controller) {
      const key = keySelector(chunk);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(chunk);
    },
    flush(controller) {
      for (const [key, values] of groups) {
        controller.enqueue([key, values]);
      }
      controller.terminate();
    }
  });
} 