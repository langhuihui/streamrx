export function withLatestFrom<T, R>(
  streams: ReadableStream<T>[],
  project: (value: T, ...latestValues: T[]) => R
) {
  const latestValues: (T | undefined)[] = new Array(streams.length).fill(undefined);
  let activeStreams = streams.length;
  let hasError = false;

  return new TransformStream<T, R>({
    async transform(chunk, controller) {
      if (hasError) return;
      try {
        latestValues[0] = chunk;
        if (latestValues.every(v => v !== undefined)) {
          controller.enqueue(project(chunk, ...latestValues.slice(1) as T[]));
        }
      } catch (error) {
        hasError = true;
        controller.error(error);
      }
    },
    async flush(controller) {
      if (activeStreams-- === 0) {
        controller.terminate();
      }
    }
  });
} 