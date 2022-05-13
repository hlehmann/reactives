import { isSource, ReactiveSourceUtils } from "./source";

type ControlledSource<
  S extends ReactiveSourceUtils,
  C extends Record<string, unknown>
> = {
  readonly [K in keyof S]: S[K] extends ReactiveSourceUtils
    ? ControlledSource<S[K], C>
    : S[K];
} & C;

export function createControlledSource<
  S extends ReactiveSourceUtils,
  C extends Record<string, unknown>
>(source: S, controls: C): ControlledSource<S, C> {
  function returnChild(key: keyof S) {
    const child = source[key];
    return isSource(child) ? createControlledSource(child, controls) : child;
  }

  return new Proxy(source as never, {
    get(_, key) {
      if (key in controls) {
        return controls[key as string];
      }
      return returnChild(key as keyof S);
    },
    set() {
      return false;
    },
    deleteProperty() {
      return false;
    },
  });
}
