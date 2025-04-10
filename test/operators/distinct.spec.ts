import { distinct } from '../../operators/distinct';

describe('distinct operator', () => {
  it('should filter out duplicate values', async () => {
    const input = [1, 2, 2, 3, 3, 3, 4];
    const expected = [1, 2, 3, 4];

    const result: number[] = [];
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    await stream
      .pipeThrough(distinct())
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should use keySelector to determine uniqueness', async () => {
    const input = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 1, value: 'c' },
      { id: 3, value: 'd' }
    ];
    const expected = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'd' }
    ];

    const result: typeof input = [];
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    await stream
      .pipeThrough(distinct({ keySelector: x => x.id }))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should use custom compare function', async () => {
    const input = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 1, value: 'c' },
      { id: 3, value: 'd' }
    ];
    const expected = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'd' }
    ];

    const result: typeof input = [];
    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    await stream
      .pipeThrough(distinct({ 
        compare: (a, b) => a.id === b.id 
      }))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle empty stream', async () => {
    const result: number[] = [];
    const stream = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });

    await stream
      .pipeThrough(distinct())
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual([]);
  });

  it('should handle error in keySelector', async () => {
    const input = [1, 2, 3];
    let error: Error | undefined;

    const stream = new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    });

    try {
      await stream
        .pipeThrough(distinct({ 
          keySelector: () => { throw new Error('KeySelector error'); } 
        }))
        .pipeTo(new WritableStream());
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('KeySelector error');
  });
}); 