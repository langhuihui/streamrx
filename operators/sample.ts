const noop = () => {};

export function sample<T>(notifier: ReadableStream<any>) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      let lastValue = chunk;
      
      notifier.pipeTo(new WritableStream({
        write() {
          controller.enqueue(lastValue);
        }
      })).catch(noop);
    }
  });
}

export function sampleTime<T>(period: number) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      let lastValue = chunk;
      setInterval(() => {
        controller.enqueue(lastValue);
      }, period);
    }
  });
} 