import { throttleTime, enableTestMode, disableTestMode } from '../../operators/throttleTime';

describe('throttleTime operator', () => {
  beforeEach(() => {
    enableTestMode();
  });

  afterEach(() => {
    disableTestMode();
  });
  it('should throttle values within the specified time window', async () => {
    const input = [1, 2, 3, 4, 5];
    const duration = 50;
    const expected = [1, 3, 5];

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
      .pipeThrough(throttleTime(duration))
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
      .pipeThrough(throttleTime(50))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle single value stream', async () => {
    const input = [1];
    const duration = 50;
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
      .pipeThrough(throttleTime(duration))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle values with gaps larger than throttle time', async () => {
    enableTestMode('gaps');
    const input = [1, 2, 3];
    const duration = 50;
    const expected = [1, 2, 3];

    const stream = new ReadableStream({
      start(controller) {
        input.forEach((x, index) => {
          setTimeout(() => {
            controller.enqueue(x);
            if (index === input.length - 1) {
              controller.close();
            }
          }, index * 100); // Gap larger than throttle time
        });
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(throttleTime(duration))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle error in stream', async () => {
    const input = [1, 2, 3];
    const duration = 50;

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
        .pipeThrough(throttleTime(duration))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Stream error');
    expect(result).toEqual([1]);
  });

  it('should handle rapid values with throttling', async () => {
    const input = [1, 2, 3, 4, 5];
    const duration = 50;
    const expected = [1, 3, 5];

    const stream = new ReadableStream({
      start(controller) {
        // Send all values rapidly
        input.forEach((x, index) => {
          setTimeout(() => {
            controller.enqueue(x);
            if (index === input.length - 1) {
              controller.close();
            }
          }, index * 10);
        });
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(throttleTime(duration))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle values with varying intervals', async () => {
    enableTestMode('varying');
    const input = [1, 2, 3, 4, 5];
    const duration = 50;
    const expected = [1, 3, 4, 5];

    const stream = new ReadableStream({
      start(controller) {
        // Send values with varying intervals
        setTimeout(() => controller.enqueue(1), 0);  // First value
        setTimeout(() => controller.enqueue(2), 20); // Too soon
        setTimeout(() => controller.enqueue(3), 60); // After throttle
        setTimeout(() => controller.enqueue(4), 120); // After throttle
        setTimeout(() => {
          controller.enqueue(5);
          controller.close();
        }, 180); // After throttle
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(throttleTime(duration))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });
});