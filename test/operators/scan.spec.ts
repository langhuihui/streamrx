import { scan } from '../../operators/scan.js';

describe('scan operator', () => {
  it('should accumulate values using the provided function', async () => {
    const input = [1, 2, 3, 4, 5];
    const accumulator = (acc: number, curr: number) => acc + curr;
    const seed = 0;
    const expected = [1, 3, 6, 10, 15];
    
    const stream = new ReadableStream<number>({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(scan(accumulator, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle empty stream', async () => {
    const stream = new ReadableStream<number>({
      start(controller) {
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(scan((acc: number, curr: number) => acc + curr, 0))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle single value stream', async () => {
    const input = [5];
    const accumulator = (acc: number, curr: number) => acc + curr;
    const seed = 0;
    const expected = [5];
    
    const stream = new ReadableStream<number>({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(scan(accumulator, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle different types', async () => {
    const input = ['a', 'b', 'c'];
    const accumulator = (acc: string[], curr: string) => [...acc, curr];
    const seed: string[] = [];
    const expected = [['a'], ['a', 'b'], ['a', 'b', 'c']];
    
    const stream = new ReadableStream<string>({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: string[][] = [];
    await stream
      .pipeThrough(scan(accumulator, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle error in accumulator function', async () => {
    const input = [1, 2, 3];
    const accumulator = (acc: number, curr: number) => {
      if (curr === 2) throw new Error('Accumulator error');
      return acc + curr;
    };
    const seed = 0;
    
    const stream = new ReadableStream<number>({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    let error: Error | undefined;

    try {
      await stream
        .pipeThrough(scan(accumulator, seed))
        .pipeTo(new WritableStream({
          write(chunk) {
            result.push(chunk);
          }
        }));
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Accumulator error');
    expect(result).toEqual([1]); // Only first value was processed
  });

  it('should handle complex accumulation', async () => {
    interface InputType {
      id: number;
      value: number;
    }
    
    const input: InputType[] = [
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    ];
    
    type AccType = { [key: number]: number };
    
    const accumulator = (acc: AccType, curr: InputType): AccType => ({
      ...acc,
      [curr.id]: curr.value
    });
    
    const seed: AccType = {};
    const expected: AccType[] = [
      { 1: 10 },
      { 1: 10, 2: 20 },
      { 1: 10, 2: 20, 3: 30 }
    ];
    
    const stream = new ReadableStream<InputType>({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: AccType[] = [];
    await stream
      .pipeThrough(scan(accumulator, seed))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });
}); 