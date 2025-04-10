export function share<T>() {
  let subscribers = 0;
  let source: ReadableStream<T> | null = null;
  let controller: ReadableStreamDefaultController<T> | null = null;

  return new TransformStream<T, T>({
    start(controller) {
      source = this.readable;
      controller = controller;
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
    cancel() {
      if (--subscribers === 0 && controller) {
        controller.close();
      }
    }
  });
} 