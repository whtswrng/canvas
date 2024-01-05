import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../../App";

const ControlsContext = createContext();

export const ControlsProvider = ({ children }) => {
  const [panelName, setPanelName] = useState(null);

  const changeTo = (name) => {
    setPanelName(name);
  };

  return <ControlsContext.Provider value={{ panelName, changeTo }}>{children}</ControlsContext.Provider>;
};

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error("useCombatControls must be used within a CombatControlsProvider");
  }
  return context;
};
