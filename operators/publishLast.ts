export function publishLast<T>() {
  let lastValue: T | null = null;
  let subscribers = 0;
  let source: ReadableStream<T> | null = null;
  let controller: ReadableStreamDefaultController<T> | null = null;

  return new TransformStream<T, T>({
    start(controller) {
      source = this.readable;
      controller = controller;
    },
    transform(chunk, controller) {
      lastValue = chunk;
      controller.enqueue(chunk);
    },
    flush(controller) {
      if (lastValue !== null) {
        controller.enqueue(lastValue);
      }
      controller.terminate();
    },
    cancel() {
      if (--subscribers === 0 && controller) {
        controller.close();
      }
    }
  });
} 