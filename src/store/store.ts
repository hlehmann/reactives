import { createControlledSource } from "../core/controlled";
import { ReactiveRaw } from "../core/raw";
import { getSource, ReactiveSource } from "../core/source";
import {
  AddFirstArgResolvers,
  OmitFirstArgResolvers,
  Resolvers,
} from "../core/utils";

export const MUTATIONS_KEY = "$mutations";

type MutationsResolvers<S> = AddFirstArgResolvers<Resolvers, S>;

export function createStore<
  R extends ReactiveRaw,
  M extends MutationsResolvers<ReactiveSource<R>>
>(initialValue: R, mutations: M) {
  const rootSource = getSource(initialValue);

  const exposedMutations = new Proxy(mutations as never, {
    get(_, key) {
      return (...args: unknown[]): unknown =>
        mutations[key as keyof M]?.(rootSource, ...args);
    },
  }) as OmitFirstArgResolvers<M>;

  const controls = {
    [MUTATIONS_KEY]: exposedMutations,
  };

  return createControlledSource(rootSource, controls);
}
