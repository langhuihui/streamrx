import { lazy } from '../index';

describe('lazy function', () => {
  it('should create a lazy stream that can be piped through', async () => {
    const input = [1, 2, 3];
    const transform = new TransformStream<number, number>({
      transform(chunk, controller) {
        controller.enqueue(chunk * 2);
      }
    });
    const expected = [2, 4, 6];

    const result: number[] = [];
    const stream = lazy(() => new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    }));

    await stream
      .pipeThrough(transform)
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle async stream creation', async () => {
    const input = [1, 2, 3];
    const transform = new TransformStream<number, number>({
      transform(chunk, controller) {
        controller.enqueue(chunk * 2);
      }
    });
    const expected = [2, 4, 6];

    const result: number[] = [];
    const stream = lazy(async () => new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    }));

    await stream
      .pipeThrough(transform)
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle async transform stream creation', async () => {
    const input = [1, 2, 3];
    const expected = [2, 4, 6];

    const result: number[] = [];
    const stream = lazy(() => new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    }));

    await stream
      .pipeThrough(async () => new TransformStream<number, number>({
        transform(chunk, controller) {
          controller.enqueue(chunk * 2);
        }
      }))
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle stream pipe options', async () => {
    const input = [1, 2, 3];
    const transform = new TransformStream<number, number>({
      transform(chunk, controller) {
        controller.enqueue(chunk * 2);
      }
    });
    const expected = [2, 4, 6];

    const result: number[] = [];
    const stream = lazy(() => new ReadableStream({
      start(controller) {
        input.forEach(x => controller.enqueue(x));
        controller.close();
      }
    }));

    await stream
      .pipeThrough(transform, { preventClose: true })
      .pipeTo(new WritableStream({
        write(chunk) {
          result.push(chunk);
        }
      }));

    expect(result).toEqual(expected);
  });

  it('should handle errors in stream creation', async () => {
    const stream = lazy(() => {
      throw new Error('Stream creation error');
    });

    let error: Error | undefined;
    try {
      await stream
        .pipeThrough(new TransformStream())
        .pipeTo(new WritableStream());
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toBe('Stream creation error');
  });
}); 