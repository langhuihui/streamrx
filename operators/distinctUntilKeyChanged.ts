export function distinctUntilKeyChanged<T, K extends keyof T>(key: K) {
  let previous: T[K] | undefined;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (previous === undefined || previous !== chunk[key]) {
        previous = chunk[key];
        controller.enqueue(chunk);
      }
    }
  });
} 