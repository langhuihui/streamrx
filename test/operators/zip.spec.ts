import { zip } from '../../operators/zip.js';

describe('zip operator', () => {
  it('should combine values from multiple streams in pairs', async () => {
    const stream1 = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.close();
      }
    });

    const stream2 = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('a');
        controller.enqueue('b');
        controller.close();
      }
    });

    const expected: [number, string][] = [[1, 'a'], [2, 'b']];
    const result: [number, string][] = [];

    await stream1
      .pipeThrough(zip<[number, string]>(stream2))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk as [number, string]);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle empty streams', async () => {
    const stream1 = new ReadableStream<number>({
      start(controller) {
        controller.close();
      }
    });

    const stream2 = new ReadableStream<string>({
      start(controller) {
        controller.close();
      }
    });

    const result: [number, string][] = [];

    await stream1
      .pipeThrough(zip<[number, string]>(stream2))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk as [number, string]);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle streams of different lengths', async () => {
    const stream1 = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.close();
      }
    });

    const stream2 = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('a');
        controller.enqueue('b');
        controller.close();
      }
    });

    const expected: [number, string][] = [[1, 'a'], [2, 'b']];
    const result: [number, string][] = [];

    await stream1
      .pipeThrough(zip<[number, string]>(stream2))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk as [number, string]);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle error in first stream', async () => {
    const stream1 = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.error(new Error('Stream 1 error'));
      }
    });

    const stream2 = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('a');
        controller.close();
      }
    });

    const result: [number, string][] = [];
    let error: Error | undefined;

    try {
      await stream1
        .pipeThrough(zip<[number, string]>(stream2))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk as [number, string]);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Stream 1 error');
    expect(result).toEqual([]);
  });

  it('should handle error in second stream', async () => {
    const stream1 = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.close();
      }
    });

    const stream2 = new ReadableStream<string>({
      start(controller) {
        controller.error(new Error('Stream 2 error'));
      }
    });

    const result: [number, string][] = [];
    let error: Error | undefined;

    try {
      await stream1
        .pipeThrough(zip<[number, string]>(stream2))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk as [number, string]);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Stream 2 error');
    expect(result).toEqual([]);
  });

  it('should handle multiple streams with different types', async () => {
    const stream1 = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.close();
      }
    });

    const stream2 = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('a');
        controller.enqueue('b');
        controller.close();
      }
    });

    const stream3 = new ReadableStream<boolean>({
      start(controller) {
        controller.enqueue(true);
        controller.enqueue(false);
        controller.close();
      }
    });

    const expected: [number, string, boolean][] = [[1, 'a', true], [2, 'b', false]];
    const result: [number, string, boolean][] = [];

    await stream1
      .pipeThrough(zip<[number, string]>(stream2))
      .pipeThrough(zip<[number, string, boolean]>(stream3))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk as [number, string, boolean]);
        }
      }));

    expect(result).toEqual(expected);
  });
}); 