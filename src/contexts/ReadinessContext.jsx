import React, { createContext, useContext, useState } from 'react';

// The modal (and its form libraries) is downloaded the first time someone
// opens the readiness check, not on every page load.
const ReadinessCheckModal = React.lazy(() => import('@/components/ReadinessCheckModal'));

const ReadinessContext = createContext();

export const useReadiness = () => useContext(ReadinessContext);

export const ReadinessProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const openReadinessCheck = () => { setEverOpened(true); setIsOpen(true); };
  const closeReadinessCheck = () => setIsOpen(false);

  return (
    <ReadinessContext.Provider value={{ openReadinessCheck, closeReadinessCheck }}>
      {children}
      {everOpened && (
        <React.Suspense fallback={null}>
          <ReadinessCheckModal isOpen={isOpen} onClose={closeReadinessCheck} />
        </React.Suspense>
      )}
    </ReadinessContext.Provider>
  );
};
