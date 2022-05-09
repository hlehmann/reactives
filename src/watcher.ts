import {
  isSource,
  REACTIVE_RAW_KEY,
  REACTIVE_WATCH_KEY,
  ReactiveSourceUtils,
} from "./source";

export const REACTIVE_SOURCE_KEY = "$source";

export type Watcher<S extends ReactiveSourceUtils = ReactiveSourceUtils> = {
  readonly [K in keyof S]: S[K] extends ReactiveSourceUtils
    ? Watcher<S[K]>
    : S[K];
} & WatcherUtils<S>;

interface WatcherUtils<S> {
  [REACTIVE_SOURCE_KEY]: S;
}

export function createWatcher<S extends ReactiveSourceUtils>(
  source: S,
  invalidate: () => void
): Watcher<S> {
  const deepSource = source;

  function returnChild(key: keyof S) {
    const child = source[key];
    source[REACTIVE_WATCH_KEY](key as string, invalidate);
    return isSource(child) ? createWatcher(child, invalidate) : child;
  }

  return new Proxy<Watcher<S>>(deepSource as never, {
    get(_, key) {
      switch (key) {
        case REACTIVE_SOURCE_KEY:
          return source;

        case REACTIVE_RAW_KEY:
        case REACTIVE_WATCH_KEY:
          return source[key];

        default:
          return returnChild(key as keyof S);
      }
    },
    set() {
      return false;
    },
  });
}
