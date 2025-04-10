export function pairwise<T>() {
  let prev: T;
  let isFirst = true;
  return new TransformStream<T, [T, T]>({
    transform(chunk, controller) {
      if (isFirst) {
        prev = chunk;
        isFirst = false;
      } else {
        controller.enqueue([prev, chunk]);
        prev = chunk;
      }
    }
  });
} 