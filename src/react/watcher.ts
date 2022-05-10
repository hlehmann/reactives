import { useMemo, useState } from "react";

import { ReactiveRaw } from "../raw";
import { ReactiveRef } from "../ref";
import { getSource, ReactiveSourceUtils } from "../source";
import { createWatcher, Watcher } from "../watcher";
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
