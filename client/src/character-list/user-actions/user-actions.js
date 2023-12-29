import { useState } from "react";

export const UserActions = () => {
  const [autoAttack, setAutoAttack] = useState(false);
  const [autoDefend, setAutoDefend] = useState(false);

  const handleAutoDefend = () => {
    setAutoDefend((prev) => !prev);
  };

  const handleAutoAttack = () => {
    setAutoAttack((prevEnabled) => !prevEnabled);
  };

  return (
    <div className="actions user">
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
        Auto attack
      </button>
    </div>
  );
};
