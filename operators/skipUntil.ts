import { noop } from '../index';

export function skipUntil<T>(control: ReadableStream) {
  const abortCtrl = new AbortController();
  return new TransformStream<T, T>({
    start(controller) {
      control.pipeTo(new WritableStream({
        write(chunk) {
          abortCtrl.abort('skipUntil');
        }
      }), abortCtrl).catch(noop);
    },
    transform(chunk, controller) {
      if (abortCtrl.signal.aborted) {
        controller.enqueue(chunk);
      }
    }
  });
} 