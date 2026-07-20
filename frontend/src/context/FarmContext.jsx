import React, { createContext, useContext, useState, useEffect } from 'react';

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const [farmProfile, setFarmProfile] = useState(() => {
    const savedFarm = localStorage.getItem('khedut_farm_context');
    if (savedFarm) {
      try {
        return JSON.parse(savedFarm);
      } catch (e) {
        console.error("Failed to parse saved farm context");
      }
    }
    return {
      state: '',
      district: '',
      season: '',
      soilType: '',
      farmArea: '',
      waterAvailability: '',
      selectedCrop: '',
      cropDuration: '',
      selectedYear: new Date().getFullYear().toString()
    };
  });

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('khedut_farm_context', JSON.stringify(farmProfile));
  }, [farmProfile]);

  const updateFarmContext = (updates) => {
    setFarmProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetFarmContext = () => {
    setFarmProfile({
      state: '',
      district: '',
      season: '',
      soilType: '',
      farmArea: '',
      waterAvailability: '',
      selectedCrop: '',
      cropDuration: '',
      selectedYear: new Date().getFullYear().toString()
    });
  };

  return (
    <FarmContext.Provider value={{ farmProfile, updateFarmContext, resetFarmContext }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarmContext() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarmContext must be used within a FarmProvider');
  }
  return context;
}
