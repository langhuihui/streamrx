export function ignoreElements<T>() {
  return new TransformStream<T, never>({
    transform() {
      // Ignore all elements
    }
  });
} 