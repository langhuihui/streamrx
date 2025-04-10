export function skipWhile<T>(f: (item: T) => boolean) {
  let skip = true;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (skip && !f(chunk)) {
        skip = false;
      }
      if (!skip) controller.enqueue(chunk);
    }
  });
} 