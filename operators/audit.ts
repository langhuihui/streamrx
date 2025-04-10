export function audit<T>(durationSelector: (value: T) => ReadableStream<any>) {
  return new TransformStream<T, T>({
    async transform(chunk: T, controller: TransformStreamDefaultController<T>) {
      let lastValue = chunk;
      try {
        await durationSelector(chunk).pipeTo(new WritableStream({
          write() {
            controller.enqueue(lastValue);
          }
        }));
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

export function auditTime<T>(duration: number) {
  return new TransformStream<T, T>({
    transform(chunk: T, controller: TransformStreamDefaultController<T>) {
      let lastValue = chunk;
      setTimeout(() => {
        controller.enqueue(lastValue);
      }, duration);
    }
  });
} 