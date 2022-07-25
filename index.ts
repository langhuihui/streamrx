export type EventHandler<T> = (event: T) => void;
export function noop() {

}
export const CANCEL = 'cancel';
type EventMethod<N, T> = (name: N, handler: EventHandler<T>) => void;
export type EventDispachter<N, T> = {
  on: EventMethod<N, T>;
  off: EventMethod<N, T>;
} | {
  addListener: EventMethod<N, T>;
  removeListener: EventMethod<N, T>;
} | {
  addEventListener: EventMethod<N, T>;
  removeEventListener: EventMethod<N, T>;
};
export type ReadableStreamTuple<T> = {
  [K in keyof T]: ReadableStream<T[K]>;
};
export function lazy<I>(begin: () => ReadableStream<I> | Promise<ReadableStream<I>>) {
  return {
    pipeThrough: <O>(tran: TransformStream<I, O> | (() => TransformStream<I, O> | Promise<TransformStream<I, O>>), options?: StreamPipeOptions) => lazy(async () => (await begin()).pipeThrough(typeof tran === 'function' ? await tran() : tran, options)),
    pipeTo: async (dest: WritableStream<I>, options?: StreamPipeOptions) => (await begin()).pipeTo(dest, options)
  };
}
export function fromEvent<T, N>(target: EventDispachter<N, T>, eventName: N) {
  let handler: (event: T) => void;
  return new ReadableStream<T>({
    start(controller) {
      handler = controller.enqueue.bind(controller);
      if ("addEventListener" in target) {
        target.addEventListener(eventName, handler);
      } else if ("addListener" in target) {
        target.addListener(eventName, handler);
      } else if ("on" in target) {
        target.on(eventName, handler);
      }
    },
    cancel(reason: any) {
      if ("removeEventListener" in target) {
        target.removeEventListener(eventName, handler);
      } else if ("removeListener" in target) {
        target.removeListener(eventName, handler);
      } else if ("off" in target) {
        target.off(eventName, handler);
      }
    }
  });
}
export function fromPromise<T>(promise: Promise<T>) {
  return new ReadableStream<T>({
    async start(controller) {
      try {
        controller.enqueue(await promise);
        controller.close();
      } catch (err) {
        return controller.error(err);
      }
    }
  });
}
export function fromAnimationFrame() {
  let id: number;
  return new ReadableStream<DOMHighResTimeStamp>({
    start(controller) {
      id = requestAnimationFrame((t) => controller.enqueue(t));
    },
    cancel() {
      cancelAnimationFrame(id);
    }
  });
}
export function interval(ms: number) {
  let interval: ReturnType<typeof setInterval>;
  return new ReadableStream<number>({
    start(controller) {
      let i = 0;
      interval = setInterval(() => controller.enqueue(i++), ms);
    },
    cancel() {
      clearInterval(interval);
    }
  });
}
export function timer(delay: number, ms?: number) {
  let timer: ReturnType<typeof setTimeout>;
  let interval: ReturnType<typeof setInterval>;
  return new ReadableStream<number>({
    start(controller) {
      let i = 0;
      const next = () => controller.enqueue(i++);
      timer = setTimeout(() => {
        next();
        if (ms) interval = setInterval(next, ms);
        else controller.close();
      }, delay);
    },
    cancel() {
      clearTimeout(timer);
      clearInterval(interval);
    }
  });
}
export function of<T>(...item: T[]) {
  return new ReadableStream<T>({
    start(controller) {
      item.forEach(item => controller.enqueue(item));
      controller.close();
    }
  });
}
export function empty() {
  return new ReadableStream<never>({
    start(controller) {
      controller.close();
    }
  });
}
export function never() {
  return new ReadableStream<never>();
}
export function throwError<T>(error: T) {
  return new ReadableStream<T>({
    start(controller) {
      controller.error(error);
    }
  });
}
export function filter<T>(f: (item: T) => boolean) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (f(chunk)) controller.enqueue(chunk);
    },
  });
}
export function map<I, O>(f: (item: I) => O) {
  return new TransformStream<I, O>({
    transform(chunk, controller) {
      controller.enqueue(f(chunk));
    },
  });
}
export function take<T>(count: number) {
  if (count <= 0) throw new Error("count must be greater than 0");
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
      if (--count === 0) controller.terminate();
    }
  });
}
export function skip<T>(count: number) {
  if (count <= 0) throw new Error("count must be greater than 0");
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (--count > 0) return;
      controller.enqueue(chunk);
    }
  });
}
export function takeUntil<T>(control: ReadableStream) {
  return new TransformStream<T, T>({
    start(controller) {
      const abortCtrl = new AbortController();
      control.pipeTo(new WritableStream({
        write(chunk) {
          abortCtrl.abort('takeUntil');
          controller.terminate();
        }
      }), abortCtrl).catch(noop);
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
    }
  });
}
export function skipUntil<T>(control: ReadableStream) {
  const abortCtrl = new AbortController();
  return new TransformStream<T, T>({
    start(controller) {
      control.pipeTo(new WritableStream({
        write(chunk) {
          abortCtrl.abort('skipUntil');
        }
      }), abortCtrl).catch(noop);
    },
    transform(chunk, controller) {
      if (abortCtrl.signal.aborted) {
        controller.enqueue(chunk);
      }
    }
  });
}
export function takeWhile<T>(f: (item: T) => boolean) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (f(chunk)) controller.enqueue(chunk);
      else controller.terminate();
    }
  });
}
export function skipWhile<T>(f: (item: T) => boolean) {
  let skip = true;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (skip && !f(chunk)) {
        skip = false;
      }
      if (!skip) controller.enqueue(chunk);
    }
  });
}
function createWS<T>(controller: ReadableStreamDefaultController<T> | TransformStreamDefaultController<T>) {
  return new WritableStream<T>({
    write(chunk) {
      controller.enqueue(chunk);
    }
  });
}
export function concat<T>(...streams: ReadableStream<T>[]) {
  let index = 0;
  const abortCtrl = new AbortController();
  let { readable, writable } = new TransformStream({
    start() {
      streams.reduce(
        (a, res, i, arr) => a.then(() => res.pipeTo(writable, { signal: abortCtrl.signal, preventClose: (i + 1) !== arr.length })),
        Promise.resolve()
      ).catch(noop);
    }
  });
  return readable;
  return new ReadableStream<T>({
    start(controller) {
      const ws = createWS(controller);
      const pipeOne = () => {
        if (index === streams.length) {
          controller.close();
          return Promise.resolve();
        }
        return streams[index++].pipeTo(ws, abortCtrl);
      };
      pipeOne().then(pipeOne, e => abortCtrl.signal.aborted || controller.error(e));
    },
    cancel() {
      abortCtrl.abort();
    }
  });
}
export function merge<T>(...streams: ReadableStream<T>[]) {
  const abortCtrl = new AbortController();
  return new ReadableStream<T>({
    start(controller) {
      Promise.all(streams.map(s => s.pipeTo(createWS(controller), abortCtrl))).then(() => controller.close(), e => abortCtrl.signal.aborted || controller.error(e));
    },
    cancel() {
      abortCtrl.abort();
    }
  });
}
export function debounceTime<T>(ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      clearTimeout(timer);
      timer = setTimeout(() => controller.enqueue(chunk), ms);
    }
  });
}
const defaultThrottleConfig = {
  leading: true,
  trailing: false,
};
export function throttleTime<T>(ms: number, config = defaultThrottleConfig) {
  let muted: number;
  let last: T;
  let hasValue = false;
  const unmute = (controller: TransformStreamDefaultController<T>) => {
    muted = 0;
    if (config.trailing) {
      send(controller);
    }
  };
  const mute = (controller: TransformStreamDefaultController<T>) => {
    muted = setTimeout(unmute, ms, controller);
  };
  const send = (controller: TransformStreamDefaultController<T>) => {
    if (hasValue) {
      try {
        controller.enqueue(last);
      } catch (err) {
        clearTimeout(muted);
      }
      hasValue = false;
    }
  };
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      last = chunk;
      hasValue = true;
      if (!muted) {
        if (config.leading) {
          send(controller);
        }
        mute(controller);
      }
    },
  });
}
export function startWith<T>(item: T) {
  return new TransformStream<T, T>({
    start(controller) {
      controller.enqueue(item);
    },
  });
}
export function combineLatest<A extends unknown[]>(...streams: ReadableStreamTuple<A>) {
  const nTotal = streams.length;
  let nRun = nTotal;//剩余未发出事件的事件流数量
  const abortCtrl = new AbortController();
  const array: A = new Array(nTotal) as A;
  return new ReadableStream<A>({
    start(controller) {
      Promise.all(streams.map((s, i) => s.pipeTo(new WritableStream<A[number]>({
        start() {
          nRun--;
        },
        write(chunk) {
          array[i] = chunk;
          if (nRun == 0) controller.enqueue(array);
        }
      }), abortCtrl))).then(() => controller.close(), e => abortCtrl.signal.aborted || controller.error(e));
    },
    cancel(reason: any) {
      abortCtrl.abort(reason);
    }
  });
}
export function switchMap<I, O>(f: (item: I) => ReadableStream<O>) {
  let abortController: AbortController;
  let waitSubPipe: Promise<void>;
  return new TransformStream<I, O>({
    transform(chunk, controller) {
      if (abortController) abortController.abort('switchMap');
      abortController = new AbortController();
      waitSubPipe = f(chunk).pipeTo(new WritableStream({
        write(chunk) {
          try {
            controller.enqueue(chunk);
          } catch (err) {
            abortController.abort(CANCEL);
          }
        }
      }), abortController).catch(noop);
    },
    async flush(controller) {
      if (waitSubPipe) await waitSubPipe;
      controller.terminate();
    }
  });
}
export function concatMap<I, O>(f: (item: I) => ReadableStream<O>) {
  const abortController = new AbortController();
  return new TransformStream<I, O>({
    async transform(chunk, controller) {
      await f(chunk).pipeTo(new WritableStream({
        write(chunk) {
          try {
            controller.enqueue(chunk);
          } catch (err) {
            abortController.abort(CANCEL);
          }
        }
      }), abortController).catch(noop);
    },
  });
}
export function mergeMap<I, O>(f: (item: I) => ReadableStream<O>) {
  return new TransformStream<I, O>({
    transform(chunk, controller) {
      const abortController = new AbortController();
      f(chunk).pipeTo(new WritableStream({
        write(chunk) {
          try {
            controller.enqueue(chunk);
          } catch (err) {
            abortController.abort(CANCEL);
          }
        }
      }), abortController).catch(noop);
    },
  });
}
export function tap(f: (item: any) => void) {
  return map(item => (f(item), item));
}
export function range(start: number, count: number = Number.POSITIVE_INFINITY) {
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i < count) {
        controller.enqueue(start + i++);
      } else {
        controller.close();
      }
    }
  });
}