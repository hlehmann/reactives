export const REACTIVE_RAW_KEY = "$raw";
export const REACTIVE_WATCH_KEY = "$watch";
export const REACTIVE_SOURCE_KEY = "$source";

const sourcesCache = new WeakMap<ReactiveRaw, ReactiveSource>();

export type ReactiveRaw = Record<string, unknown>;
export type ReactiveSource<R extends ReactiveRaw = ReactiveRaw> = {
  [K in keyof R]: R[K] extends ReactiveRaw ? ReactiveSource<R[K]> : R[K];
} & ReactiveSourceUtils<R>;

interface ReactiveSourceUtils<R extends ReactiveRaw = ReactiveRaw> {
  [REACTIVE_RAW_KEY]: R;
  [REACTIVE_WATCH_KEY](key: keyof R, listener: () => void): void;
}

export function isRaw(child: unknown): child is ReactiveRaw {
  return !!child && typeof child === "object";
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

      Object.assign(raw, { [key]: value as R[keyof R] });
      trigger(key as keyof R);
      return true;
    },
  });
}

export function isSource(child: unknown): child is ReactiveSource {
  return (
    !!child && typeof child === "object" && !!child[REACTIVE_WATCH_KEY as never]
  );
}

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
