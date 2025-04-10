export function single<T>(predicate?: (item: T) => boolean) {
  let found = false;
  let value: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (!predicate || predicate(chunk)) {
        if (found) {
          controller.error(new Error('More than one value'));
        } else {
          found = true;
          value = chunk;
        }
      }
    },
    flush(controller) {
      if (!found) {
        controller.error(new Error('No value'));
      } else {
        controller.enqueue(value);
        controller.terminate();
      }
    }
  });
} 