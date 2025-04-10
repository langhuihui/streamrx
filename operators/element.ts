export function elementAt<T>(index: number) {
  let currentIndex = 0;
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (currentIndex === index) {
        controller.enqueue(chunk);
        controller.terminate();
      }
      currentIndex++;
    },
    flush(controller) {
      if (currentIndex <= index) {
        controller.enqueue(undefined);
      }
      controller.terminate();
    }
  });
}

export function first<T>(predicate?: (value: T) => boolean) {
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (!predicate || predicate(chunk)) {
        controller.enqueue(chunk);
        controller.terminate();
      }
    },
    flush(controller) {
      controller.enqueue(undefined);
      controller.terminate();
    }
  });
}

export function last<T>(predicate?: (value: T) => boolean) {
  let lastValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (!predicate || predicate(chunk)) {
        lastValue = chunk;
      }
    },
    flush(controller) {
      controller.enqueue(lastValue);
      controller.terminate();
    }
  });
}

export function single<T>(predicate?: (value: T) => boolean) {
  let found = false;
  let singleValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (!predicate || predicate(chunk)) {
        if (found) {
          controller.error(new Error('More than one value found'));
        } else {
          found = true;
          singleValue = chunk;
        }
      }
    },
    flush(controller) {
      if (!found) {
        controller.error(new Error('No value found'));
      } else {
        controller.enqueue(singleValue);
      }
      controller.terminate();
    }
  });
} 