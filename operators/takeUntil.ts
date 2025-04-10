import { noop } from '../index';

export function takeUntil<T>(control: ReadableStream) {
  return new TransformStream<T, T>({
    start(controller) {
      const abortCtrl = new AbortController();
      control.pipeTo(new WritableStream({
        write(chunk) {
          abortCtrl.abort('takeUntil');
          controller.terminate();
        }
      }), abortCtrl).catch(noop);
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
    }
  });
} 