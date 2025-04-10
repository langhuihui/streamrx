export function combineLatest<T, R>(
  streams: ReadableStream<T>[],
  project: (...values: T[]) => R
) {
  const latestValues: (T | undefined)[] = new Array(streams.length).fill(undefined);
  let activeStreams = streams.length;
  
  return streams.map((stream, index) => 
    new TransformStream<T, R>({
      async transform(chunk, controller) {
        latestValues[index] = chunk;
        if (latestValues.every(v => v !== undefined)) {
          controller.enqueue(project(...latestValues as T[]));
        }
      },
      async flush(controller) {
        if (activeStreams-- === 0) {
          controller.terminate();
        }
      }
    })
  );
} 