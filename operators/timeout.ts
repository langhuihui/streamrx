export function timeout<T>(dueTime: number, errorFactory?: () => Error): TransformStream<T, T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isTerminated = false;

  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (isTerminated) return;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (!isTerminated) {
          const error = errorFactory ? errorFactory() : new Error('Timeout');
          controller.error(error);
        }
        timeoutId = null;
      }, dueTime);

      controller.enqueue(chunk);
    },
    flush(controller) {
      isTerminated = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  });
} 