export function map<I, O>(f: (item: I) => O) {
  return new TransformStream<I, O>({
    transform(chunk, controller) {
      controller.enqueue(f(chunk));
    },
  });
} 