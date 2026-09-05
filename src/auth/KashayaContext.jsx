import { createContext, useContext, useEffect, useState } from 'react';

const KashayaContext = createContext(null);

const STORAGE_KEY = 'vedikshaya_current_kashaya';
const DEFAULT_KASHAYA = 'Dashamoola Kwatha';

export function KashayaProvider({ children }) {
  const [kashaya, setKashaya] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_KASHAYA);

  useEffect(() => {
    if (kashaya) localStorage.setItem(STORAGE_KEY, kashaya);
  }, [kashaya]);

  return (
    <KashayaContext.Provider value={{ kashaya, setKashaya }}>{children}</KashayaContext.Provider>
  );
}

export function useKashaya() {
  const ctx = useContext(KashayaContext);
  if (!ctx) throw new Error('useKashaya must be used within a KashayaProvider');
  return ctx;
}
