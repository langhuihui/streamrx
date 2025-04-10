import { debounceTime, enableTestMode, disableTestMode } from '../../operators/debounceTime';

describe('debounceTime operator', () => {
  beforeEach(() => {
    enableTestMode();
  });

  afterEach(() => {
    disableTestMode();
  });
  it('should debounce values within the specified time window', async () => {
    const input = [1, 2, 3, 4, 5];
    const delay = 50;
    const expected = [5];

    const stream = new ReadableStream({
      start(controller) {
        input.forEach((x, index) => {
          setTimeout(() => {
            controller.enqueue(x);
            if (index === input.length - 1) {
              controller.close();
            }
          }, index * 20);
        });
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(debounceTime(delay))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle empty stream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(debounceTime(50))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle single value stream', async () => {
    const input = [1];
    const delay = 50;
    const expected = [1];

    const stream = new ReadableStream({
      start(controller) {
        setTimeout(() => {
          controller.enqueue(input[0]);
          controller.close();
        }, 0);
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(debounceTime(delay))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle values with gaps larger than debounce time', async () => {
    const input = [1, 2, 3];
    const delay = 50;
    const expected = [1, 2, 3];

    const stream = new ReadableStream({
      start(controller) {
        input.forEach((x, index) => {
          setTimeout(() => {
            controller.enqueue(x);
            if (index === input.length - 1) {
              controller.close();
            }
          }, index * 100); // Gap larger than debounce time
        });
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(debounceTime(delay))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle error in stream', async () => {
    const input = [1, 2, 3];
    const delay = 50;

    const stream = new ReadableStream({
      start(controller) {
        setTimeout(() => {
          controller.enqueue(1);
          controller.error(new Error('Stream error'));
        }, 0);
      }
    });

    const result: number[] = [];
    let error: Error | undefined;

    try {
      await stream
        .pipeThrough(debounceTime(delay))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Stream error');
    expect(result).toEqual([]);
  });

  it('should handle multiple rapid values followed by a gap', async () => {
    enableTestMode('rapid');
    const input = [1, 2, 3, 4, 5];
    const delay = 50;
    const expected = [5];

    const stream = new ReadableStream({
      start(controller) {
        // Send first 4 values rapidly
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            controller.enqueue(input[i]);
          }, i * 10);
        }
        // Send last value after a gap
        setTimeout(() => {
          controller.enqueue(input[4]);
          controller.close();
        }, 100);
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(debounceTime(delay))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });
});