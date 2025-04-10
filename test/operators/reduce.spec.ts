import { reduce, enableTestMode, disableTestMode } from '../../operators/reduce';

describe('reduce operator', () => {
  beforeEach(() => {
    enableTestMode();
  });

  afterEach(() => {
    disableTestMode();
  });
  it('should reduce values to a single value', async () => {
    const input = [1, 2, 3, 4, 5];
    const reducer = (acc: number, curr: number) => acc + curr;
    const seed = 0;
    const expected = 15;

    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(reduce(reducer, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([expected]);
  });

  it('should handle empty stream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(reduce((acc: number, curr: number) => acc + curr, 0))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([0]); // Returns seed value for empty stream
  });

  it('should handle single value stream', async () => {
    const input = [5];
    const reducer = (acc: number, curr: number) => acc + curr;
    const seed = 0;
    const expected = 5;

    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(reduce(reducer, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([expected]);
  });

  it('should handle error in reducer function', async () => {
    const input = [1, 2, 3];
    const reducer = (acc: number, curr: number) => {
      if (curr === 2) throw new Error('Reducer error');
      return acc + curr;
    };
    const seed = 0;

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
        .pipeThrough(reduce(reducer, seed))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Reducer error');
    expect(result).toEqual([1]); // Only first value was processed
  });

  it('should handle complex reduction', async () => {
    const input = [
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    ];
    const reducer = (acc: Record<number, number>, curr: { id: number, value: number }) => ({
      ...acc,
      [curr.id]: curr.value
    });
    const seed: Record<number, number> = {};
    const expected = {
      1: 10,
      2: 20,
      3: 30
    };

    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: Record<number, number>[] = [];
    await stream
      .pipeThrough(reduce(reducer, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([expected]);
  });

  it('should handle string concatenation', async () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const reducer = (acc: string, curr: string) => acc + curr;
    const seed = '';
    const expected = 'abcde';

    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: string[] = [];
    await stream
      .pipeThrough(reduce(reducer, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([expected]);
  });

  it('should handle array reduction', async () => {
    const input = [[1, 2], [3, 4], [5]];
    const reducer = (acc: number[], curr: number[]) => [...acc, ...curr];
    const seed: number[] = [];
    const expected = [1, 2, 3, 4, 5];

    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[][] = [];
    await stream
      .pipeThrough(reduce(reducer, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([expected]);
  });
});