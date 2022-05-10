import { createContext, useContext, useMemo } from "react";

import { RefsStore } from "../ref";

const RefsContext = createContext<RefsStore | undefined>(undefined);

interface RefsStoreProviderProps {
  children: React.ReactNode;
  refsStore?: RefsStore;
}

export function RefsStoreProvider({
  children,
  refsStore,
}: RefsStoreProviderProps) {
  const value = useMemo(() => refsStore || new RefsStore(), [refsStore]);

  return <RefsContext.Provider value={value}>{children}</RefsContext.Provider>;
}

export function useRefsStore() {
  return useContext(RefsContext);
}
