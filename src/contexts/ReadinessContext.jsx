import React, { createContext, useContext, useState } from 'react';
import ReadinessCheckModal from '@/components/ReadinessCheckModal';

const ReadinessContext = createContext();

export const useReadiness = () => useContext(ReadinessContext);

export const ReadinessProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openReadinessCheck = () => setIsOpen(true);
  const closeReadinessCheck = () => setIsOpen(false);

  return (
    <ReadinessContext.Provider value={{ openReadinessCheck, closeReadinessCheck }}>
      {children}
      <ReadinessCheckModal isOpen={isOpen} onClose={closeReadinessCheck} />
    </ReadinessContext.Provider>
  );
};