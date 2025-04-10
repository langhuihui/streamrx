export function skip<T>(count: number) {
  if (count <= 0) {
    return new TransformStream<T, T>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      }
    });
  }
  let remaining = count;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (remaining > 0) {
        remaining--;
        return;
      }
      controller.enqueue(chunk);
    }
  });
} 