import { ensureRefStore, isRef, ReactiveRef, RefsStore } from "./ref";
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
  source: S | ReactiveRef<S>,
  invalidate: () => void,
  refStore?: RefsStore
): Watcher<S> {
  const realSource = isRef(source)
    ? ensureRefStore(refStore).get(source)
    : source;

  function returnChild(key: keyof S) {
    const child = realSource[key];
    realSource[REACTIVE_WATCH_KEY](key as string, invalidate);
    return isSource(child) ? createWatcher(child, invalidate) : child;
  }

  return new Proxy<Watcher<S>>(realSource as never, {
    get(_, key) {
      switch (key) {
        case REACTIVE_SOURCE_KEY:
          return realSource;

        case REACTIVE_RAW_KEY:
        case REACTIVE_WATCH_KEY:
          return realSource[key];

        default:
          return returnChild(key as keyof S);
      }
    },
    set() {
      return false;
    },
  });
}
