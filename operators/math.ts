export function max<T>(comparator?: (a: T, b: T) => number) {
  let maxValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (maxValue === undefined) {
        maxValue = chunk;
      } else if (comparator) {
        if (comparator(chunk, maxValue) > 0) {
          maxValue = chunk;
        }
      } else if (chunk > maxValue) {
        maxValue = chunk;
      }
    },
    flush(controller) {
      controller.enqueue(maxValue);
      controller.terminate();
    }
  });
}

export function min<T>(comparator?: (a: T, b: T) => number) {
  let minValue: T | undefined;
  return new TransformStream<T, T | undefined>({
    transform(chunk, controller) {
      if (minValue === undefined) {
        minValue = chunk;
      } else if (comparator) {
        if (comparator(chunk, minValue) < 0) {
          minValue = chunk;
        }
      } else if (chunk < minValue) {
        minValue = chunk;
      }
    },
    flush(controller) {
      controller.enqueue(minValue);
      controller.terminate();
    }
  });
}

export function average<T extends number>() {
  let sum = 0;
  let count = 0;
  return new TransformStream<T, number | undefined>({
    transform(chunk, controller) {
      sum += chunk;
      count++;
    },
    flush(controller) {
      controller.enqueue(count > 0 ? sum / count : undefined);
      controller.terminate();
    }
  });
} 