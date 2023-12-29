import React, { useEffect, useState } from "react";
import { socket } from "../../App";
import { useControls } from "./controls-context";

// export const useControls = (type) => {
//   const [list, setList] = useState([]);
//   useEffect(() => {
//     // Emit the payload to the server
//     socket.emit("UPDATE_COMBAT_CONTROLS", list);
//   }, [list]);

//   function save(payload) {
//     setList((prev) => [...prev, payload]);
//   }

//   function remove(actionToRemove) {
//     setList((prev) => {
//       const updatedList = prev.filter((action) => action !== actionToRemove);
//       return updatedList;
//     });
//   }

//   return { save, list, remove };
// };

export const Combat = () => {
  const [selectedAction, setSelectedAction] = useState(""); // Selected action type
  const [selectedValue, setSelectedValue] = useState(""); // Selected value (e.g., location)
  const [selectedCondition, setSelectedCondition] = useState(""); // Selected condition (e.g., "if hp is")
  const [conditionValue, setConditionValue] = useState(""); // Selected condition (e.g., "if hp is")
  const [comparisonValue, setComparisonValue] = useState(""); // Comparison value for conditions

  const {getControls, save, remove} = useControls('combat');

  const list = getControls('combat')

  const handleActionChange = (event) => {
    setSelectedAction(event.target.value);
  };

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleConditionChange = (event) => {
    setSelectedCondition(event.target.value);
  };

  const handleComparisonValueChange = (event) => {
    setComparisonValue(event.target.value);
  };

  const handleExecuteAction = () => {
    // Implement logic to execute the selected action with specified parameters
    console.log("Executing Action:", selectedAction);
    console.log("Selected Value:", selectedValue);
    console.log("Condition:", selectedCondition);
    console.log("Comparison Value:", comparisonValue);

    // Prepare payload for socket emit
    const actionPayload = {
      type: 'combat',
      actionType: selectedAction,
      actionValue: selectedValue,
      condition: selectedCondition,
      conditionValue: conditionValue,
      conditionComparisonValue: comparisonValue,
    };

    save(actionPayload)
  };

  function handleRemoveAction(actionToRemove) {
    remove(actionToRemove)
  }

  // Component to render each action row
  const ActionRow = ({ action }) => (
    <div key={action.id} className="action-row">
      <span style={{ marginLeft: 0 }}>{action.condition}</span>
      <span>{action.conditionValue}</span>
      <span>{action.conditionComparisonValue}%</span>
      <span>{action.actionType}</span>
      <span style={{ fontWeight: "bold" }}>{action.actionValue}</span>
      <span
        style={{ fontWeight: "bold", cursor: "pointer", marginLeft: 10 }}
        onClick={() => handleRemoveAction(action)}
      >
        x
      </span>
    </div>
  );

  return (
    <div className="control-panel-item card">
      <h3>Combat</h3>
      <div>
        <label>Condition:</label>
        <select value={selectedCondition} onChange={handleConditionChange}>
          <option value="">None</option>
          <option value="ifHp">If my hp is</option>
          <option value="ifPartyMemberHp">If my party member hp is</option>
          <option value="ifTargetHp">If target hp is</option>
          <option value="ifTargetMana">If target mana is</option>
        </select>
      </div>
      {selectedCondition && (
        <div>
          <div>
            <label>Condition value:</label>
            <select
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
            >
              <option value="isEqual">Equal</option>
              <option value="isLowerThan">Lower</option>
              <option value="isHigherThan">Higher</option>
            </select>
          </div>
          <div>
            <label>Comparison Value:</label>
            <input
              type="text"
              value={comparisonValue}
              onChange={handleComparisonValueChange}
            />
          </div>
        </div>
      )}
      <div>
        <label>Action Type:</label>
        <select value={selectedAction} onChange={handleActionChange}>
          <option value="">Select Action</option>
          <option value="useSpell">Use spell</option>
          <option value="useItem">Use item</option>
        </select>
      </div>
      <div>
        <label>Value:</label>
        <select value={selectedValue} onChange={handleValueChange}>
          <option value="">Select spell</option>
          <option value="spell1">Spell 1</option>
          <option value="spell2">Spell 2</option>
          <option value="spell3">Spell 3</option>
        </select>
      </div>
      <div>
        <button onClick={handleExecuteAction}>Create action</button>
      </div>
      <div className="action-list">
        {list.map((action, index) => (
          <ActionRow key={index} action={action} />
        ))}
      </div>
    </div>
  );
};
