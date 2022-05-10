/* eslint-disable @typescript-eslint/no-explicit-any */
export type Resolvers = Record<string, (...args: any[]) => any>;

export type OmitFirstArg<F> = F extends (
  first: any,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

export type AddFirstArg<F, A> = F extends (...args: infer P) => infer R
  ? (first: A, ...args: P) => R
  : never;

export type OmitFirstArgResolvers<R extends Resolvers> = {
  [K in keyof R]: OmitFirstArg<R[K]>;
};

export type AddFirstArgResolvers<R extends Resolvers, A> = {
  [K in keyof R]: AddFirstArg<R[K], A>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
