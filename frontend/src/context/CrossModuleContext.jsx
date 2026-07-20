import React, { createContext, useContext, useState } from 'react';

const CrossModuleContext = createContext(null);

export function CrossModuleProvider({ children }) {
  // State holds the outputs from each intelligent workspace
  const [moduleOutputs, setModuleOutputs] = useState({});

  /**
   * Publish a module's output into the global Cross Module Intelligence layer.
   * Standard contract: { moduleName, inputs, outputs, lastUpdated, version }
   * 
   * @param {string} moduleName - Name of the module (e.g. 'CropPlanner', 'YieldPredictor', 'SmartIrrigation')
   * @param {object} data - The module's full response object / plan
   * @param {object} inputs - The specific farm inputs used to generate this plan
   */
  const publishModuleOutput = (moduleName, data, inputs) => {
    setModuleOutputs(prev => ({
      ...prev,
      [moduleName]: {
        moduleName,
        inputs: { ...inputs },
        outputs: data,
        lastUpdated: new Date().toISOString(),
        version: "4.0"
      }
    }));
  };

  const getModuleOutput = (moduleName) => {
    return moduleOutputs[moduleName] || null;
  };

  const isModuleSynchronized = (moduleName, currentFarmProfile) => {
    const mod = moduleOutputs[moduleName];
    if (!mod) return false;
    
    // Simplistic synchronization check - compare key fields to see if the module output was generated for the current farm context
    // This could be made more sophisticated depending on module requirements.
    let isSync = true;
    if (mod.inputs.state && mod.inputs.state !== currentFarmProfile.state) isSync = false;
    if (mod.inputs.district && mod.inputs.district !== currentFarmProfile.district) isSync = false;
    if (mod.inputs.season && mod.inputs.season !== currentFarmProfile.season) isSync = false;
    if (mod.inputs.crop && mod.inputs.crop !== currentFarmProfile.selectedCrop) isSync = false;
    if (mod.inputs.area && mod.inputs.area.toString() !== currentFarmProfile.farmArea.toString()) isSync = false;

    return isSync;
  };

  return (
    <CrossModuleContext.Provider value={{ 
      moduleOutputs, 
      publishModuleOutput, 
      getModuleOutput,
      isModuleSynchronized 
    }}>
      {children}
    </CrossModuleContext.Provider>
  );
}

export function useCrossModuleContext() {
  const context = useContext(CrossModuleContext);
  if (!context) {
    throw new Error('useCrossModuleContext must be used within a CrossModuleProvider');
  }
  return context;
}
