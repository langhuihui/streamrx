export function delay<T>(dueTime: number): TransformStream<T, T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isTerminated = false;

  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (isTerminated) return;

      timeoutId = setTimeout(() => {
        if (!isTerminated) {
          controller.enqueue(chunk);
        }
        timeoutId = null;
      }, dueTime);
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