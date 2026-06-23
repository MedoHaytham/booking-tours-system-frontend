'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message }
  const timerRef = useRef(null);

  const hideAlert = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAlert(null);
  }, []);

  const showAlert = useCallback((type, message, duration = 5000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAlert({ type, message });
    timerRef.current = setTimeout(() => setAlert(null), duration);
  }, []);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used inside <AlertProvider>');
  return ctx;
}
