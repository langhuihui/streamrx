export function empty() {
  return new ReadableStream<never>({
    start(controller) {
      controller.close();
    }
  });
} 
 