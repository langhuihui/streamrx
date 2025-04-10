export function throwError(error: any) {
  return new ReadableStream<never>({
    start(controller) {
      controller.error(error);
    }
  });
} 