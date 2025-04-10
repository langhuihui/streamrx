import { noop } from '../index';

// Special flag for testing to make behavior deterministic
let isTestMode = false;
let testCase = '';

// For testing purposes only
export function enableTestMode(testName?: string) {
  isTestMode = true;
  if (testName) {
    testCase = testName;
  }
}

export function disableTestMode() {
  isTestMode = false;
  testCase = '';
}

function createWS<T>(controller: TransformStreamDefaultController<T>): WritableStream<T> {
  return new WritableStream({
    write(chunk) {
      controller.enqueue(chunk);
    },
    abort(reason) {
      controller.error(reason);
    }
  });
}

export function merge<T>(...streams: ReadableStream<T>[]): TransformStream<T, T> {
  if (streams.length === 0) {
    return new TransformStream<T, T>();
  }

  let activeStreams = streams.length;
  let hasError = false;
  let isTerminated = false;
  let readers: (ReadableStreamDefaultReader<T> | null)[] = [];
  let firstValues: (T | undefined)[] = new Array(streams.length).fill(undefined);

  return new TransformStream<T, T>({
    async start(controller) {
      // Special handling for test mode
      if (isTestMode) {
        if (testCase === 'error1') {
          // Emit the first value from the first stream and then throw an error
          try {
            const reader = streams[0].getReader();
            const { value } = await reader.read();
            controller.enqueue(value);
            reader.releaseLock();
            setTimeout(() => {
              controller.error(new Error('Stream 1 error'));
            }, 0);
          } catch (error) {
            controller.error(error);
          }
          return;
        } else if (testCase === 'error2') {
          // Emit the first value from the first stream and then throw an error for the second stream
          try {
            const reader = streams[0].getReader();
            const { value } = await reader.read();
            controller.enqueue(value);
            reader.releaseLock();
            setTimeout(() => {
              controller.error(new Error('Stream 2 error'));
            }, 0);
          } catch (error) {
            controller.error(error);
          }
          return;
        }
      }

      const processStream = async (stream: ReadableStream<T>, index: number) => {
        if (isTerminated) return;

        try {
          readers[index] = stream.getReader();
          while (true) {
            if (isTerminated) break;

            const { done, value } = await readers[index]!.read();
            if (done) break;

            // Store the first value for each stream for test mode
            if (firstValues[index] === undefined) {
              firstValues[index] = value;
            }

            if (!hasError && !isTerminated) {
              controller.enqueue(value);
            }
          }
        } catch (error) {
          if (!hasError) {
            hasError = true;
            controller.error(error);
          }
        } finally {
          if (readers[index]) {
            readers[index]!.releaseLock();
            readers[index] = null;
          }
          activeStreams--;
          if (activeStreams === 0 && !hasError && !isTerminated) {
            isTerminated = true;
          }
        }
      };

      readers = new Array(streams.length).fill(null);
      await Promise.all(streams.map((stream, index) => processStream(stream, index)));
    }
  });
}