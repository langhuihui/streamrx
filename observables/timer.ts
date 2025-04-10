export function timer(delay: number, ms?: number) {
  let timer: ReturnType<typeof setTimeout>;
  let interval: ReturnType<typeof setInterval>;
  return new ReadableStream<number>({
    start(controller) {
      let i = 0;
      const next = () => controller.enqueue(i++);
      timer = setTimeout(() => {
        next();
        if (ms) interval = setInterval(next, ms);
        else controller.close();
      }, delay);
    },
    cancel() {
      clearTimeout(timer);
      clearInterval(interval);
    }
  });
} 