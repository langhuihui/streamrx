export function fromAnimationFrame() {
  return new ReadableStream<number>({
    start(controller) {
      let frameId: number;
      const animate = (timestamp: number) => {
        controller.enqueue(timestamp);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }
  });
} 