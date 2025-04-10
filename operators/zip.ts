export function zip<T extends unknown[]>(...streams: ReadableStream<unknown>[]): TransformStream<unknown, T> {
  if (streams.length === 0) {
    return new TransformStream<unknown, T>({
      start(controller) {
        controller.terminate();
      }
    });
  }

  const buffers: unknown[][] = streams.map(() => []);
  let activeStreams = streams.length;
  let hasError = false;

  return new TransformStream<unknown, T>({
    async start(controller) {
      const processStream = async (stream: ReadableStream<unknown>, index: number) => {
        try {
          const reader = stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            if (hasError) {
              return;
            }
            buffers[index].push(value);
            const minLength = Math.min(...buffers.map(b => b.length));
            if (minLength > 0) {
              const zipped = buffers.map(b => b.shift()) as T;
              controller.enqueue(zipped);
            }
          }
        } catch (error) {
          hasError = true;
          controller.error(error);
        } finally {
          activeStreams--;
          if (activeStreams === 0 && !hasError) {
            controller.terminate();
          }
        }
      };

      // Process all streams concurrently
      await Promise.all(streams.map(processStream));
    }
  });
} 