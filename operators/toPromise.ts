export function toPromise<T>() {
  let value: T | undefined;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (value !== undefined) {
        controller.error(new Error('Stream has more than one value'));
      } else {
        value = chunk;
      }
    },
    flush(controller) {
      if (value === undefined) {
        controller.error(new Error('Stream has no values'));
      } else {
        controller.enqueue(value);
        controller.terminate();
      }
    }
  });
} 