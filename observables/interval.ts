export function interval(ms: number) {
  let interval: ReturnType<typeof setInterval>;
  return new ReadableStream<number>({
    start(controller) {
      let i = 0;
      interval = setInterval(() => controller.enqueue(i++), ms);
    },
    cancel() {
      clearInterval(interval);
    }
  });
} 