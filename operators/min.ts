export function min<T extends number | string | Date>(comparator?: (a: T, b: T) => number) {
  let minValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk) {
      if (minValue === undefined) {
        minValue = chunk;
      } else if (comparator) {
        if (comparator(chunk, minValue) < 0) {
          minValue = chunk;
        }
      } else if (chunk < minValue) {
        minValue = chunk;
      }
    },
    flush(controller) {
      controller.enqueue(minValue);
      controller.terminate();
    }
  });
} 