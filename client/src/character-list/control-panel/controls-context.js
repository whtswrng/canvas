import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../../App";

const ControlsContext = createContext();

export const ControlsProvider = ({ children }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    // Emit the payload to the server
    console.log("updating controls", list);
    socket.emit("UPDATE_CONTROLS", { playerId: null, list });
  }, [list]);

  const save = (payload) => {
    setList((prev) => [...prev, payload]);
  };

  const replace = (payload) => {
    setList((prev) => {
      const i = prev.findIndex((p) => p.type === payload.type);
      const newList = [...prev];
      if (i !== -1) {
        newList[i] = { ...payload };
      } else {
        newList.push(payload)
      }
      return newList;
    });
  };

  const remove = (actionToRemove) => {
    setList((prev) => {
      const updatedList = prev.filter((action) => action !== actionToRemove);
      return updatedList;
    });
  };

  const getControls = (type) => list.filter((e) => e.type === type);

  return (
    <ControlsContext.Provider value={{ getControls, save, remove, replace }}>
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
