import { noop } from '../index';

export interface ConnectableConfig<T> {
  connector?: () => void;
  resetOnDisconnect?: boolean;
}

export function connectableObservable<T, R = T>(
  selector?: (source: ReadableStream<T>) => ReadableStream<R>,
  config: ConnectableConfig<T> = {}
) {
  let subscribers = 0;
  const abortController = new AbortController();
  const buffer: T[] = [];

  return new ReadableStream<R>({
    start(controller) {
      subscribers++;
      
      if (selector) {
        // If selector is provided, use it to transform the source stream
        const transformedStream = selector(new ReadableStream<T>({
          start(controller) {
            // Replay buffered values
            for (const value of buffer) {
              controller.enqueue(value);
            }
          },
          pull(controller) {
            if (buffer.length > 0) {
              controller.enqueue(buffer.shift()!);
            }
          }
        }));

        transformedStream.pipeTo(new WritableStream({
          write(chunk) {
            controller.enqueue(chunk as R);
          }
        }), abortController).catch(noop);
      }
    },
    pull(controller) {
      if (buffer.length > 0) {
        controller.enqueue(buffer.shift()! as R);
      }
    },
    cancel(reason) {
      subscribers--;
      if (subscribers === 0) {
        abortController.abort(reason);
        if (config.resetOnDisconnect) {
          buffer.length = 0;
        }
      }
    }
  });
} 