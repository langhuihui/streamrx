import { map } from '../../operators/map.js';

describe('map operator', () => {
  it('should transform each value using the provided function', async () => {
    const input = [1, 2, 3];
    const transform = (x: number) => x * 2;
    const expected = [2, 4, 6];
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(map(transform))
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
      .pipeThrough(map((x: number) => x * 2))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle different types', async () => {
    const input = [1, 2, 3];
    const transform = (x: number) => `Value: ${x}`;
    const expected = ['Value: 1', 'Value: 2', 'Value: 3'];
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: string[] = [];
    await stream
      .pipeThrough(map(transform))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle errors in transform function', async () => {
    const input = [1, 2, 3];
    const transform = (x: number) => {
      if (x === 2) throw new Error('Test error');
      return x * 2;
    };
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    let error: Error | undefined;

    try {
      await stream
        .pipeThrough(map(transform))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Test error');
    expect(result).toEqual([2]); // Only first value was processed
  });
}); 