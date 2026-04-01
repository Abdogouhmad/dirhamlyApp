import { createContext, useContext, useRef } from "react";

interface RefreshContextValue {
  /** Register a refresh callback from any page */
  register: (fn: () => Promise<void>) => void;
  /** Call the currently registered refresh callback */
  refresh: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextValue>({
  register: () => {},
  refresh: async () => {},
});

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const callbackRef = useRef<(() => Promise<void>) | null>(null);

  const register = (fn: () => Promise<void>) => {
    callbackRef.current = fn;
  };

  const refresh = async () => {
    if (callbackRef.current) {
      await callbackRef.current();
    }
  };

  return (
    <RefreshContext.Provider value={{ register, refresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export const useRefresh = () => useContext(RefreshContext);
