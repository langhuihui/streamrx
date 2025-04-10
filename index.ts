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

// Observable creators
export * from './observables/fromEvent';
export * from './observables/fromPromise';
export * from './observables/fromAnimationFrame';
export * from './observables/interval';
export * from './observables/timer';
export * from './observables/of';
export * from './observables/empty';
export * from './observables/never';
export * from './observables/throwError';

// Operators
export * from './operators/filter';
export * from './operators/map';
export * from './operators/take';
export * from './operators/skip';
export * from './operators/takeUntil';
export * from './operators/skipUntil';
export * from './operators/takeWhile';
export * from './operators/skipWhile';
export * from './operators/concat';
export * from './operators/merge';
export * from './operators/zip';
export * from './operators/sample';
export * from './operators/scan';
export * from './operators/multicast';
export * from './operators/publish';
export * from './operators/publishBehavior';
export * from './operators/combineLatest';
export * from './operators/audit';
export * from './operators/debounceTime';
export * from './operators/throttleTime';
export * from './operators/withLatestFrom';
export * from './operators/pairwise';
export * from './operators/every';
export * from './operators/some';
export * from './operators/find';
export * from './operators/findIndex';
export * from './operators/indexOf';
export * from './operators/lastIndexOf';
export * from './operators/includes';
export * from './operators/distinct';
export * from './operators/distinctUntilChanged';
export * from './operators/distinctUntilKeyChanged';
export * from './operators/ignoreElements';
export * from './operators/elementAt';
export * from './operators/first';
export * from './operators/last';
export * from './operators/single';
export * from './operators/count';
export * from './operators/max';
export * from './operators/min';
export * from './operators/reduce';
export * from './operators/toArray';
export * from './operators/toSet';
export * from './operators/toMap';
export * from './operators/toObject';
export * from './operators/toPromise';
export * from './operators/endWith';
export * from './operators/expand';
export * from './operators/finalize';
export * from './operators/groupBy';
export * from './operators/partition';
export * from './operators/pluck';
export * from './operators/publishLast';
export * from './operators/publishReplay';
export * from './operators/race';
export * from './operators/refCount';
export * from './operators/share';
export * from './operators/shareReplay';
export * from './operators/startWith';