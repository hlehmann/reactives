export type ReactiveRaw = Record<string, unknown>;

export function isRaw(child: unknown): child is ReactiveRaw {
  return !!child && typeof child === "object";
}
