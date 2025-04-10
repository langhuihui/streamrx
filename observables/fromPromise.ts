export function fromPromise<T>(promise: Promise<T>) {
  return new ReadableStream<T>({
    async start(controller) {
      try {
        controller.enqueue(await promise);
        controller.close();
      } catch (err) {
        return controller.error(err);
      }
    }
  });
} 