import React, { useState } from "react";
import { useControls } from "./controls-context";
import { ActionRow } from "./control";

export const Pathing = () => {
  const type = "pathing";
  const [selectedAction, setSelectedAction] = useState(""); // Selected action type
  const [selectedValue, setSelectedValue] = useState(""); // Selected value (e.g., location)
  const [selectedCondition, setSelectedCondition] = useState(""); // Selected condition (e.g., "if hp is")
  const [conditionValue, setConditionValue] = useState("");
  const [comparisonValue, setComparisonValue] = useState(""); // Comparison value for conditions

  const { getControls, save, remove } = useControls(type);
  const list = getControls(type);

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

  const handleRemoveAction = (actionToRemove) => {
    remove(actionToRemove);
  };

  const handleExecuteAction = () => {
    const actionPayload = {
      type,
      actionType: selectedAction,
      actionValue: selectedValue,
      condition: selectedCondition,
      conditionValue: conditionValue,
      conditionComparisonValue: comparisonValue,
      value: selectedValue,
    };

    save(actionPayload);
  };

  return (
    <div className="control-panel-item card">
      <h3>Pathing</h3>
      <div>
        <label>Action Type:</label>
        <select value={selectedAction} onChange={handleActionChange}>
          <option value="">Select Action</option>
          <option value="goToPosition">Go to Position</option>
          <option value="attackEnemy">Attack Enemy</option>
          <option value="gatherObject">Gather Object</option>
        </select>
      </div>
      <div>
        <label>Value:</label>
        <input type="text" value={selectedValue} onChange={handleValueChange} />
      </div>
      <div>
        <label>Condition:</label>
        <select value={selectedCondition} onChange={handleConditionChange}>
          <option value="">None</option>
          <option value="ifHpIs">If HP is</option>
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
              <option value={"isEqualThan"}> Equal </option>
              <option value={"isLowerThan"}> Lower </option>
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
        <button onClick={handleExecuteAction}>Execute Action</button>
      </div>
      <div className="action-list">
        {list.map((action, index) => (
          <ActionRow
            key={index}
            action={action}
            handleRemoveAction={handleRemoveAction}
          />
        ))}
      </div>
    </div>
  );
};
