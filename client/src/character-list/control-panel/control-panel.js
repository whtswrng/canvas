import React from "react";
import Control from "./control";
import "./control-panel.css";

export const ControlPanel = () => {
  return (
    <div className="control-panel">
      <Control
        type="combat"
        title="Combat actions"
        conditionOptions={[{ value: "ifHp", label: "If my hp is" }]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[{ value: "useSpell", label: "Use spell" }]}
        valueOptions={[{ value: "spell 1", label: "Spell 1" }]}
      />
      <Control
        title="Basic actions"
        type="basic"
        conditionOptions={[
          { value: "ifHp", label: "If my hp is" },
          { value: "ifMana", label: "If my mana is" },
          { value: "ifTargetHp", label: "If target hp is" },
          { value: "ifTargetLvl", label: "If target lvl is", format: "" },
          { value: "ifTargetName", label: "If target name is" },
        ]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[
          { value: "attackEnemy", label: "Attack enemy" },
          { value: "gatherObject", label: "Gather object" },
          { value: "playAlarm", label: "Play alarm" },
        ]}
      />
      <Control
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
        actionTypes={[{ value: "goToPosition", label: "Go to position" }]}
        valueOption={true}
      />
    </div>
  );
};
