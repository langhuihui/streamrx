export function race<T>(streams: ReadableStream<T>[]) {
  let winner: ReadableStream<T> | null = null;
  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      if (!winner) {
        winner = this.readable;
        controller.enqueue(chunk);
      }
    },
    async flush(controller) {
      if (!winner) {
        controller.terminate();
      }
    }
  });
} 