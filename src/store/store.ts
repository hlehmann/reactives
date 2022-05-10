import { ReactiveRaw } from "../core/raw";
import {
  getSource,
  isSource,
  REACTIVE_RAW_KEY,
  REACTIVE_WATCH_KEY,
  ReactiveSource,
  ReactiveSourceUtils,
} from "../core/source";
import {
  AddFirstArgResolvers,
  OmitFirstArgResolvers,
  Resolvers,
} from "../core/utils";

export const MUTATIONS_KEY = "$mutations";

type MutationsResolvers<S> = AddFirstArgResolvers<Resolvers, S>;

export type ReactiveStore<
  S extends ReactiveSourceUtils,
  M extends MutationsResolvers<never>
> = {
  readonly [K in keyof S]: S[K] extends ReactiveSourceUtils
    ? ReactiveStore<S[K], M>
    : S[K];
} & ReactiveStoreUtils<M>;

interface ReactiveStoreUtils<M extends MutationsResolvers<never>> {
  [MUTATIONS_KEY]: OmitFirstArgResolvers<M>;
}

export function createStore<
  R extends ReactiveRaw,
  M extends MutationsResolvers<ReactiveSource<R>>
>(initialValue: R, mutations: M): ReactiveStore<ReactiveSource<R>, M> {
  const rootSource = getSource(initialValue);

  const $mutations = new Proxy(mutations, {
    get(_, key) {
      return (...args: unknown[]): unknown =>
        mutations[key as keyof M]?.(rootSource, ...args);
    },
  });

  function wrap<S extends ReactiveSourceUtils>(source: S): ReactiveStore<S, M> {
    function returnChild(key: keyof S) {
      const child = source[key];
      return isSource(child) ? wrap(child) : child;
    }

    return new Proxy<ReactiveStore<S, M>>(source as never, {
      get(_, key) {
        switch (key) {
          case MUTATIONS_KEY:
            return $mutations;

          case REACTIVE_WATCH_KEY:
          case REACTIVE_RAW_KEY:
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

  return wrap(rootSource);
}
