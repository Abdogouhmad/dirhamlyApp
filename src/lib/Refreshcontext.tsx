import { createContext, useContext, useRef } from "react";

interface RefreshContextValue {
  register: (fn: () => Promise<void>) => () => void; // returns unregister
  refresh: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextValue>({
  register: () => () => {},
  refresh: async () => {},
});

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  // Set instead of single ref — supports multiple subscribers
  const callbacksRef = useRef<Set<() => Promise<void>>>(new Set());

  const register = (fn: () => Promise<void>) => {
    callbacksRef.current.add(fn);
    // Return an unregister function so components can clean up on unmount
    return () => {
      callbacksRef.current.delete(fn);
    };
  };

  const refresh = async () => {
    await Promise.all([...callbacksRef.current].map((fn) => fn()));
  };

  return (
    <RefreshContext.Provider value={{ register, refresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export const useRefresh = () => useContext(RefreshContext);
