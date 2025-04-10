import { EventHandler, EventDispachter } from '../index';

export function fromEvent<T, N>(target: EventDispachter<N, T>, eventName: N) {
  let handler: (event: T) => void;
  return new ReadableStream<T>({
    start(controller) {
      handler = controller.enqueue.bind(controller);
      if ("addEventListener" in target) {
        target.addEventListener(eventName, handler);
      } else if ("addListener" in target) {
        target.addListener(eventName, handler);
      } else if ("on" in target) {
        target.on(eventName, handler);
      }
    },
    cancel(reason: any) {
      if ("removeEventListener" in target) {
        target.removeEventListener(eventName, handler);
      } else if ("removeListener" in target) {
        target.removeListener(eventName, handler);
      } else if ("off" in target) {
        target.off(eventName, handler);
      }
    }
  });
} 