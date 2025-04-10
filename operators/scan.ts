export function scan<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed: R): TransformStream<T, R> {
  let acc = seed;
  let index = 0;
  let hasError = false;

  return new TransformStream<T, R>({
    transform(chunk, controller) {
      if (hasError) return;

      try {
        acc = accumulator(acc, chunk, index++);
        controller.enqueue(acc);
      } catch (error) {
        hasError = true;
        controller.error(error);
      }
    }
  });
} 