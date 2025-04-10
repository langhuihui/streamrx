export function of<T>(...item: T[]) {
  return new ReadableStream<T>({
    start(controller) {
      item.forEach(item => controller.enqueue(item));
      controller.close();
    }
  });
} 