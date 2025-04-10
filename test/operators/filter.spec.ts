import { filter } from '../../operators/filter.js';

describe('filter operator', () => {
  it('should filter values based on predicate', async () => {
    const input = [1, 2, 3, 4, 5];
    const predicate = (x: number) => x % 2 === 0;
    const expected = [2, 4];
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(filter(predicate))
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
      .pipeThrough(filter((x: number) => x > 0))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle all values being filtered out', async () => {
    const input = [1, 2, 3, 4, 5];
    const predicate = (x: number) => x > 10;
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(filter(predicate))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle errors in predicate function', async () => {
    const input = [1, 2, 3];
    const predicate = (x: number) => {
      if (x === 2) throw new Error('Test error');
      return x > 0;
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
        .pipeThrough(filter(predicate))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Test error');
    expect(result).toEqual([1]); // Only first value was processed
  });
}); 