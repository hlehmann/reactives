import { isRaw, ReactiveRaw } from "./raw";

export const REACTIVE_RAW_KEY = "$raw";
export const REACTIVE_WATCH_KEY = "$watch";

export type ReactiveSource<R extends ReactiveRaw = ReactiveRaw> = {
  [K in keyof R]: R[K] extends ReactiveRaw ? ReactiveSource<R[K]> : R[K];
} & ReactiveSourceUtils<R>;

export interface ReactiveSourceUtils<R extends ReactiveRaw = ReactiveRaw> {
  [REACTIVE_RAW_KEY]: R;
  [REACTIVE_WATCH_KEY](key: keyof R, listener: () => void): void;
}

const sourcesCache = new WeakMap<ReactiveRaw, ReactiveSource>();

export function isSource(child: unknown): child is ReactiveSource {
  return (
    !!child && typeof child === "object" && !!child[REACTIVE_WATCH_KEY as never]
  );
}

export function getSource<R extends ReactiveRaw>(raw: R) {
  const cachedSource = sourcesCache.get(raw) as ReactiveSource<R>;
  if (cachedSource) return cachedSource;
  const source = createReactiveSource(raw);
  sourcesCache.set(raw, source);
  return source;
}

function createReactiveSource<R extends ReactiveRaw>(
  raw: R
): ReactiveSource<R> {
  const watchersIndex = new Map<keyof R, Set<WeakRef<() => void>>>();

  function trigger(key: keyof R) {
    const watchers = watchersIndex.get(key);
    if (!watchers) return;
    watchers.forEach((watcher) => watcher.deref()?.());
    watchersIndex.delete(key);
  }

  function watch(key: keyof R, watcher: () => void) {
    const watchers = watchersIndex.get(key);
    const ref = new WeakRef(watcher);
    if (watchers) watchers.add(ref);
    else watchersIndex.set(key, new Set([ref]));
  }

  function returnChild(key: keyof R): unknown {
    const child = raw[key];
    return isRaw(child) ? getSource(child) : child;
  }

  return new Proxy<ReactiveSource<R>>(raw as never, {
    get(_, key) {
      switch (key) {
        case REACTIVE_RAW_KEY:
          return raw;

        case REACTIVE_WATCH_KEY:
          return watch;

        default:
          return returnChild(key as keyof R);
      }
    },
    set(_, key, value) {
      const oldValue = raw[key as keyof R];
      if (oldValue === value) return true;

      raw[key as keyof R] = value as R[keyof R];
      trigger(key as keyof R);
      return true;
    },
  });
}
