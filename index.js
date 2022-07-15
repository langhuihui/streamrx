"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeMap = exports.concatMap = exports.switchMap = exports.zip = exports.combineLatest = exports.startWith = exports.throttleTime = exports.debounceTime = exports.merge = exports.concat = exports.skipWhile = exports.takeWhile = exports.skipUntil = exports.takeUntil = exports.skip = exports.take = exports.map = exports.filter = exports.throwError = exports.never = exports.empty = exports.of = exports.timer = exports.interval = exports.fromAnimationFrame = exports.fromPromise = exports.fromEvent = exports.CANCEL = exports.noop = void 0;
function noop() {
}
exports.noop = noop;
exports.CANCEL = 'cancel';
function fromEvent(target, eventName) {
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
exports.fromEvent = fromEvent;
function fromPromise(promise) {
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
exports.fromPromise = fromPromise;
function fromAnimationFrame() {
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
exports.fromAnimationFrame = fromAnimationFrame;
function interval(ms) {
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
exports.interval = interval;
function timer(delay, ms) {
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
exports.timer = timer;
function of(...item) {
    return new ReadableStream({
        start(controller) {
            item.forEach(item => controller.enqueue(item));
            controller.close();
        }
    });
}
exports.of = of;
function empty() {
    return new ReadableStream({
        start(controller) {
            controller.close();
        }
    });
}
exports.empty = empty;
function never() {
    return new ReadableStream();
}
exports.never = never;
function throwError(error) {
    return new ReadableStream({
        start(controller) {
            controller.error(error);
        }
    });
}
exports.throwError = throwError;
function filter(f) {
    return new TransformStream({
        transform(chunk, controller) {
            if (f(chunk))
                controller.enqueue(chunk);
        },
    });
}
exports.filter = filter;
function map(f) {
    return new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(f(chunk));
        },
    });
}
exports.map = map;
function take(count) {
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
exports.take = take;
function skip(count) {
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
exports.skip = skip;
function takeUntil(control) {
    return new TransformStream({
        start(controller) {
            const abortCtrl = new AbortController();
            control.pipeTo(new WritableStream({
                write(chunk) {
                    abortCtrl.abort();
                    controller.terminate();
                }
            }), abortCtrl).catch(noop);
        },
        transform(chunk, controller) {
            controller.enqueue(chunk);
        }
    });
}
exports.takeUntil = takeUntil;
function skipUntil(control) {
    const abortCtrl = new AbortController();
    return new TransformStream({
        start(controller) {
            control.pipeTo(new WritableStream({
                write(chunk) {
                    abortCtrl.abort();
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
exports.skipUntil = skipUntil;
function takeWhile(f) {
    return new TransformStream({
        transform(chunk, controller) {
            if (f(chunk))
                controller.enqueue(chunk);
            else
                controller.terminate();
        }
    });
}
exports.takeWhile = takeWhile;
function skipWhile(f) {
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
exports.skipWhile = skipWhile;
function createWS(controller) {
    return new WritableStream({
        write(chunk) {
            controller.enqueue(chunk);
        }
    });
}
function concat(...streams) {
    let index = 0;
    const abortCtrl = new AbortController();
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
exports.concat = concat;
function merge(...streams) {
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
exports.merge = merge;
function debounceTime(ms) {
    let timer;
    return new TransformStream({
        transform(chunk, controller) {
            clearTimeout(timer);
            timer = setTimeout(() => controller.enqueue(chunk), ms);
        }
    });
}
exports.debounceTime = debounceTime;
const defaultThrottleConfig = {
    leading: true,
    trailing: false,
};
function throttleTime(ms, config = defaultThrottleConfig) {
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
exports.throttleTime = throttleTime;
function startWith(item) {
    return new TransformStream({
        start(controller) {
            controller.enqueue(item);
        },
    });
}
exports.startWith = startWith;
function combineLatest(...streams) {
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
        }
    });
}
exports.combineLatest = combineLatest;
function zip(...streams) {
}
exports.zip = zip;
function switchMap(f) {
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
                        abortController.abort(exports.CANCEL);
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
exports.switchMap = switchMap;
function concatMap(f) {
    const abortController = new AbortController();
    return new TransformStream({
        async transform(chunk, controller) {
            await f(chunk).pipeTo(new WritableStream({
                write(chunk) {
                    try {
                        controller.enqueue(chunk);
                    }
                    catch (err) {
                        abortController.abort(exports.CANCEL);
                    }
                }
            }), abortController).catch(noop);
        },
    });
}
exports.concatMap = concatMap;
function mergeMap(f) {
    return new TransformStream({
        transform(chunk, controller) {
            const abortController = new AbortController();
            f(chunk).pipeTo(new WritableStream({
                write(chunk) {
                    try {
                        controller.enqueue(chunk);
                    }
                    catch (err) {
                        abortController.abort(exports.CANCEL);
                    }
                }
            }), abortController).catch(noop);
        },
    });
}
exports.mergeMap = mergeMap;
