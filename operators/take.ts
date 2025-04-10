export function take<T>(count: number) {
  if (count <= 0) {
    return new TransformStream<T, T>({
      transform(chunk, controller) {
        controller.terminate();
      }
    });
  }
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
      if (--count === 0) controller.terminate();
    }
  });
} 