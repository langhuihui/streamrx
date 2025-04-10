export interface DistinctConfig<T> {
  keySelector?: (value: T) => unknown;
  compare?: (a: T, b: T) => boolean;
}

export function distinct<T>(config: DistinctConfig<T> | ((value: T) => unknown) = (value) => value): TransformStream<T, T> {
  const keySelector = typeof config === 'function' ? config : config.keySelector ?? ((value) => value);
  const compare = typeof config === 'function' ? undefined : config.compare;
  const seen = new Set<unknown>();
  let hasError = false;

  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (hasError) return;

      try {
        const key = keySelector(chunk);
        if (compare) {
          let isDuplicate = false;
          for (const seenKey of seen) {
            if (compare(chunk, seenKey as T)) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            seen.add(key);
            controller.enqueue(chunk);
          }
        } else {
          if (!seen.has(key)) {
            seen.add(key);
            controller.enqueue(chunk);
          }
        }
      } catch (error) {
        hasError = true;
        controller.error(error);
      }
    }
  });
} 