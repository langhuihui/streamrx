export function max<T extends number | string | Date>(comparator?: (a: T, b: T) => number) {
  let maxValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk) {
      if (maxValue === undefined) {
        maxValue = chunk;
      } else if (comparator) {
        if (comparator(chunk, maxValue) > 0) {
          maxValue = chunk;
        }
      } else if (chunk > maxValue) {
        maxValue = chunk;
      }
    },
    flush(controller) {
      controller.enqueue(maxValue);
      controller.terminate();
    }
  });
} 