import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../../App";

const ControlsContext = createContext();

export const ControlsProvider = ({ children }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    // Emit the payload to the server
    socket.emit("UPDATE_CONTROLS", list);
  }, [list]);

  const save = (payload) => {
    setList((prev) => [...prev, payload]);
  };

  const remove = (actionToRemove) => {
    setList((prev) => {
      const updatedList = prev.filter((action) => action !== actionToRemove);
      return updatedList;
    });
  };

  const getControls = (type) => list.filter((e) => e.type === type);

  return (
    <ControlsContext.Provider value={{ getControls, save, remove }}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error(
      "useCombatControls must be used within a CombatControlsProvider"
    );
  }
  return context;
};
