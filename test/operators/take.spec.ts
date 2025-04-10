import { take } from '../../operators/take.js';

describe('take operator', () => {
  it('should take specified number of values', async () => {
    const input = [1, 2, 3, 4, 5];
    const count = 3;
    const expected = [1, 2, 3];
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(take(count))
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
      .pipeThrough(take(3))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle count larger than stream length', async () => {
    const input = [1, 2, 3];
    const count = 5;
    const expected = [1, 2, 3];
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(take(count))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle count of 1', async () => {
    const input = [1, 2, 3, 4, 5];
    const count = 1;
    const expected = [1];
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(take(count))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle zero count', async () => {
    const input = [1, 2, 3, 4, 5];
    const count = 0;
    
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    const result: number[] = [];
    await stream
      .pipeThrough(take(count))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });
}); 