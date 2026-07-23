import React, { createContext, useContext, useState } from 'react';

const AdPlacementContext = createContext(null);

export const useAdPlacementContext = () => {
  return useContext(AdPlacementContext);
};

export const AdPlacementProvider = ({ children, isEditorMode = false, placements, onPlacementUpdate, promos, manageZonesMode = false }) => {
  const [draggedPromo, setDraggedPromo] = useState(null);

  const value = {
    isEditorMode,
    placements, // The editor passes its local state of placements here
    promos, // The editor passes available promos
    onPlacementUpdate, // Function to update placements in the editor
    manageZonesMode,
    draggedPromo,
    setDraggedPromo
  };

  return (
    <AdPlacementContext.Provider value={value}>
      {children}
    </AdPlacementContext.Provider>
  );
};