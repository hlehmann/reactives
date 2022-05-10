import { useMemo, useState } from "react";

import { ReactiveRaw } from "../core/raw";
import { ReactiveRef } from "../core/ref";
import { getSource, ReactiveSourceUtils } from "../core/source";
import { createWatcher, Watcher } from "../core/watcher";
import { useRefsStore } from "./ref";

export function useWatcher<S extends ReactiveSourceUtils>(
  source: S | ReactiveRef<S>
): Watcher<S> {
  const refStore = useRefsStore();
  const [, setVersion] = useState(0);

  return useMemo(() => {
    const invalidate = () => setVersion((version) => version + 1);
    return createWatcher(source, invalidate, refStore);
  }, [source, refStore]);
}

export function useReactiveState<T extends ReactiveRaw>(
  initialValue: T | (() => T)
) {
  const [reactive] = useState(() =>
    getSource(initialValue instanceof Function ? initialValue() : initialValue)
  );
  return useWatcher(reactive);
}
