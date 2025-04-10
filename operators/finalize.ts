export function finalize<T>(callback: () => void) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
    flush(controller) {
      callback();
      controller.terminate();
    },
    cancel() {
      callback();
    }
  });
} 