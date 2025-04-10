export function expand<T>(
  project: (value: T) => ReadableStream<T>
) {
  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      controller.enqueue(chunk);
      try {
        const projected = project(chunk);
        const reader = projected.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    }
  });
} 