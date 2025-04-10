export function publishReplay<T>(bufferSize: number = Infinity) {
  const buffer: T[] = [];
  let subscribers = 0;
  let source: ReadableStream<T> | null = null;
  let controller: ReadableStreamDefaultController<T> | null = null;

  return new TransformStream<T, T>({
    start(controller) {
      source = this.readable;
      controller = controller;
    },
    transform(chunk, controller) {
      buffer.push(chunk);
      if (buffer.length > bufferSize) {
        buffer.shift();
      }
      controller.enqueue(chunk);
    },
    flush(controller) {
      for (const value of buffer) {
        controller.enqueue(value);
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