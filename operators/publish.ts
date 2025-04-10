export function publish<T>() {
  let subscribers = 0;
  let controller: ReadableStreamDefaultController<T> | null = null;

  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    }
  });
} 