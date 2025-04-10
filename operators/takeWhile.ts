export function takeWhile<T>(f: (item: T) => boolean) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (f(chunk)) controller.enqueue(chunk);
      else controller.terminate();
    }
  });
} 