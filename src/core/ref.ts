import { ReactiveSourceUtils } from "./source";

export type ReactiveRef<R extends ReactiveSourceUtils = ReactiveSourceUtils> =
  () => R;

export class RefsStore {
  sources = new WeakMap<
    ReactiveRef<ReactiveSourceUtils>,
    ReactiveSourceUtils
  >();

  get<S extends ReactiveSourceUtils>(ref: ReactiveRef<S>): S {
    const reactive = this.sources.get(ref) as S;
    if (reactive) return reactive;
    const newReactive = ref();
    this.sources.set(ref, newReactive);
    return newReactive;
  }
}

export function createRef<T extends ReactiveSourceUtils>(fn: () => T) {
  return fn;
}

export function isRef(child: unknown): child is ReactiveRef {
  return !!child && typeof child === "function";
}

export function ensureRefStore<T extends RefsStore>(
  refStore: T | undefined
): T {
  if (!refStore) throw new Error("RefStore is not defined");
  return refStore;
}
