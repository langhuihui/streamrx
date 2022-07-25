export function noop() {
}
export const CANCEL = 'cancel';
export function lazy(begin) {
    return {
        pipeThrough: (tran, options) => lazy(async () => (await begin()).pipeThrough(typeof tran === 'function' ? await tran() : tran, options)),
        pipeTo: async (dest, options) => (await begin()).pipeTo(dest, options)
    };
}
export function fromEvent(target, eventName) {
    let handler;
    return new ReadableStream({
        start(controller) {
            handler = controller.enqueue.bind(controller);
            if ("addEventListener" in target) {
                target.addEventListener(eventName, handler);
            }
            else if ("addListener" in target) {
                target.addListener(eventName, handler);
            }
            else if ("on" in target) {
                target.on(eventName, handler);
            }
        },
        cancel(reason) {
            if ("removeEventListener" in target) {
                target.removeEventListener(eventName, handler);
            }
            else if ("removeListener" in target) {
                target.removeListener(eventName, handler);
            }
            else if ("off" in target) {
                target.off(eventName, handler);
            }
        }
    });
}
export function fromPromise(promise) {
    return new ReadableStream({
        async start(controller) {
            try {
                controller.enqueue(await promise);
                controller.close();
            }
            catch (err) {
                return controller.error(err);
            }
        }
    });
}
export function fromAnimationFrame() {
    let id;
    return new ReadableStream({
        start(controller) {
            id = requestAnimationFrame((t) => controller.enqueue(t));
        },
        cancel() {
            cancelAnimationFrame(id);
        }
    });
}
export function interval(ms) {
    let interval;
    return new ReadableStream({
        start(controller) {
            let i = 0;
            interval = setInterval(() => controller.enqueue(i++), ms);
        },
        cancel() {
            clearInterval(interval);
        }
    });
}
export function timer(delay, ms) {
    let timer;
    let interval;
    return new ReadableStream({
        start(controller) {
            let i = 0;
            const next = () => controller.enqueue(i++);
            timer = setTimeout(() => {
                next();
                if (ms)
                    interval = setInterval(next, ms);
                else
                    controller.close();
            }, delay);
        },
        cancel() {
            clearTimeout(timer);
            clearInterval(interval);
        }
    });
}
export function of(...item) {
    return new ReadableStream({
        start(controller) {
            item.forEach(item => controller.enqueue(item));
            controller.close();
        }
    });
}
export function empty() {
    return new ReadableStream({
        start(controller) {
            controller.close();
        }
    });
}
export function never() {
    return new ReadableStream();
}
export function throwError(error) {
    return new ReadableStream({
        start(controller) {
            controller.error(error);
        }
    });
}
export function filter(f) {
    return new TransformStream({
        transform(chunk, controller) {
            if (f(chunk))
                controller.enqueue(chunk);
        },
    });
}
export function map(f) {
    return new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(f(chunk));
        },
    });
}
export function take(count) {
    if (count <= 0)
        throw new Error("count must be greater than 0");
    return new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(chunk);
            if (--count === 0)
                controller.terminate();
        }
    });
}
export function skip(count) {
    if (count <= 0)
        throw new Error("count must be greater than 0");
    return new TransformStream({
        transform(chunk, controller) {
            if (--count > 0)
                return;
            controller.enqueue(chunk);
        }
    });
}
export function takeUntil(control) {
    return new TransformStream({
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
export function skipUntil(control) {
    const abortCtrl = new AbortController();
    return new TransformStream({
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
export function takeWhile(f) {
    return new TransformStream({
        transform(chunk, controller) {
            if (f(chunk))
                controller.enqueue(chunk);
            else
                controller.terminate();
        }
    });
}
export function skipWhile(f) {
    let skip = true;
    return new TransformStream({
        transform(chunk, controller) {
            if (skip && !f(chunk)) {
                skip = false;
            }
            if (!skip)
                controller.enqueue(chunk);
        }
    });
}
function createWS(controller) {
    return new WritableStream({
        write(chunk) {
            controller.enqueue(chunk);
        }
    });
}
export function concat(...streams) {
    let index = 0;
    const abortCtrl = new AbortController();
    let { readable, writable } = new TransformStream({
        start() {
            streams.reduce((a, res, i, arr) => a.then(() => res.pipeTo(writable, { signal: abortCtrl.signal, preventClose: (i + 1) !== arr.length })), Promise.resolve()).catch(noop);
        }
    });
    return readable;
    return new ReadableStream({
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
export function merge(...streams) {
    const abortCtrl = new AbortController();
    return new ReadableStream({
        start(controller) {
            Promise.all(streams.map(s => s.pipeTo(createWS(controller), abortCtrl))).then(() => controller.close(), e => abortCtrl.signal.aborted || controller.error(e));
        },
        cancel() {
            abortCtrl.abort();
        }
    });
}
export function debounceTime(ms) {
    let timer;
    return new TransformStream({
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
export function throttleTime(ms, config = defaultThrottleConfig) {
    let muted;
    let last;
    let hasValue = false;
    const unmute = (controller) => {
        muted = 0;
        if (config.trailing) {
            send(controller);
        }
    };
    const mute = (controller) => {
        muted = setTimeout(unmute, ms, controller);
    };
    const send = (controller) => {
        if (hasValue) {
            try {
                controller.enqueue(last);
            }
            catch (err) {
                clearTimeout(muted);
            }
            hasValue = false;
        }
    };
    return new TransformStream({
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
export function startWith(item) {
    return new TransformStream({
        start(controller) {
            controller.enqueue(item);
        },
    });
}
export function combineLatest(...streams) {
    const nTotal = streams.length;
    let nRun = nTotal; //剩余未发出事件的事件流数量
    const abortCtrl = new AbortController();
    const array = new Array(nTotal);
    return new ReadableStream({
        start(controller) {
            Promise.all(streams.map((s, i) => s.pipeTo(new WritableStream({
                start() {
                    nRun--;
                },
                write(chunk) {
                    array[i] = chunk;
                    if (nRun == 0)
                        controller.enqueue(array);
                }
            }), abortCtrl))).then(() => controller.close(), e => abortCtrl.signal.aborted || controller.error(e));
        },
        cancel(reason) {
            abortCtrl.abort(reason);
        }
    });
}
export function switchMap(f) {
    let abortController;
    let waitSubPipe;
    return new TransformStream({
        transform(chunk, controller) {
            if (abortController)
                abortController.abort('switchMap');
            abortController = new AbortController();
            waitSubPipe = f(chunk).pipeTo(new WritableStream({
                write(chunk) {
                    try {
                        controller.enqueue(chunk);
                    }
                    catch (err) {
                        abortController.abort(CANCEL);
                    }
                }
            }), abortController).catch(noop);
        },
        async flush(controller) {
            if (waitSubPipe)
                await waitSubPipe;
            controller.terminate();
        }
    });
}
export function concatMap(f) {
    const abortController = new AbortController();
    return new TransformStream({
        async transform(chunk, controller) {
            await f(chunk).pipeTo(new WritableStream({
                write(chunk) {
                    try {
                        controller.enqueue(chunk);
                    }
                    catch (err) {
                        abortController.abort(CANCEL);
                    }
                }
            }), abortController).catch(noop);
        },
    });
}
export function mergeMap(f) {
    return new TransformStream({
        transform(chunk, controller) {
            const abortController = new AbortController();
            f(chunk).pipeTo(new WritableStream({
                write(chunk) {
                    try {
                        controller.enqueue(chunk);
                    }
                    catch (err) {
                        abortController.abort(CANCEL);
                    }
                }
            }), abortController).catch(noop);
        },
    });
}
export function tap(f) {
    return map(item => (f(item), item));
}
export function range(start, count = Number.POSITIVE_INFINITY) {
    let i = 0;
    return new ReadableStream({
        pull(controller) {
            if (i < count) {
                controller.enqueue(start + i++);
            }
            else {
                controller.close();
            }
        }
    });
}
