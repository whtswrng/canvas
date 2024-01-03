import React, { useState } from "react";
import Control from "./control";
import "./control-panel.css";
import { useFetch, useListen } from "../../listen";
import { ControlsProvider } from "./controls-context";

export const ControlPanel = ({ playerId }) => {
  const { data, loading } = useFetch("FETCH_CONTROL_PANEL");
  const [controlPanel, setControlPanel] = useState(null);
  const [currentControls, setCurrentControls] = useState();

  function handleControlPanelChange(event) {
    const val = event.target.value;
    setControlPanel(val);
  }

  // if(loading) return <span>...</span>

  return (
    <div className="control-panel">
      {data && (
        <div>
          <label>Condition:</label>
          <select value={controlPanel} onChange={handleControlPanelChange}>
            <option value="">None</option>
            {data.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        </div>
      )}

      <Control
        type="combat"
        title="Combat actions"
        conditionOptions={[{ value: "ifHp", label: "If my hp is" }]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[{ value: "useItem", label: "Use item" }]}
        valueOption={true}
      />

      <Control
        playerId={playerId}
        title="Pathing"
        type="pathing"
        conditionOptions={[
          { value: "ifHp", label: "If my hp is" },
          { value: "ifMana", label: "If my mana is" },
          { value: "ifTargetHp", label: "If target hp is" },
          { value: "ifTargetLvl", label: "If target hp is" },
          { value: "ifTargetName", label: "If target name is" },
        ]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[{ value: "goToPosition", label: "Go to position" }, { value: "followPlayer", label: "Follow player" }]}
        valueOption={true}
      />
      <Control
        playerId={playerId}
        title="Basic actions"
        type="basic"
        conditionOptions={[
          { value: "ifHp", label: "If my hp is" },
          { value: "ifMana", label: "If my mana is" },
          { value: "ifTargetHp", label: "If target hp is" },
          { value: "ifTargetLvl", label: "If target lvl is" },
          { value: "ifTargetName", label: "If target name is" },
        ]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[
          { value: "attackEnemy", label: "Attack enemy" },
          { value: "attackFriendlyTarget", label: "Attack friendly target" },
          { value: "gatherObject", label: "Gather object" },
          { value: "playAlarm", label: "Play alarm" },
        ]}
        valueOption={true}
      />

    </div>
  );
};
