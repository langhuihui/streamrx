export function partition<T>(
  predicate: (value: T) => boolean
) {
  const trueValues: T[] = [];
  const falseValues: T[] = [];
  return new TransformStream<T, [T[], T[]]>({
    transform(chunk, controller) {
      if (predicate(chunk)) {
        trueValues.push(chunk);
      } else {
        falseValues.push(chunk);
      }
    },
    flush(controller) {
      controller.enqueue([trueValues, falseValues]);
      controller.terminate();
    }
  });
} 