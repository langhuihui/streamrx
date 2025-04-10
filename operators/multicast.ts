export function multicast<T>(subject: ReadableStream<T>) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
      // Note: In a real implementation, we would need to handle multiple subscribers
      // and manage the subject's state. This is a simplified version.
    }
  });
} 