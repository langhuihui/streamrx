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
      controller.enqueue(undefined);
      controller.terminate();
    }
  });
} 