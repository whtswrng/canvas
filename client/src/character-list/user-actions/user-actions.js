import { useState } from "react";
import { socket } from "../../App";
import { useControls } from "../control-panel/controls-context";

export const UserActions = () => {
  const [autoAttack, setAutoAttack] = useState(false);
  const [autoDefend, setAutoDefend] = useState(false);
  const [controls, setControls] = useState(false);

  const { emit, replace } = useControls();

  const handleAutoDefend = () => {
    setAutoDefend((prevEnabled) => {
      const s = !prevEnabled;
      replace({
        type: 'autoDefend',
        actionValue: s
      })
      return s;
    });
  };

  const handleAutoAttack = () => {
    setAutoAttack((prevEnabled) => !prevEnabled);
  };

  const handleControls = () => {
    setControls((prevEnabled) => {
      const s = !prevEnabled;
      replace({
        type: 'controls',
        actionValue: s
      })
      return s;
    });
  };

  return (
    <div className="actions user">
      <button
        className={"action " + (controls ? "on" : "off")}
        onClick={handleControls}
      >
        Controls
      </button>
      <button
        className={"action " + (autoDefend ? "on" : "off")}
        onClick={handleAutoDefend}
      >
        Auto defend
      </button>
      <button
        className={"action " + (autoAttack ? "on" : "off")}
        onClick={handleAutoAttack}
      >
        PvP
      </button>
    </div>
  );
};
