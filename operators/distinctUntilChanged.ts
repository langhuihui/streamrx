export function distinctUntilChanged<T>(comparator: (prev: T, curr: T) => boolean = (prev, curr) => prev === curr) {
  let previous: T | undefined;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (previous === undefined || !comparator(previous, chunk)) {
        previous = chunk;
        controller.enqueue(chunk);
      }
    }
  });
} 