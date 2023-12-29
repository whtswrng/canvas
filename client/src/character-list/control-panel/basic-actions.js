import React, { useState } from "react";

export const BasicActions = () => {
  const [selectedAction, setSelectedAction] = useState(""); // Selected action type
  const [selectedCondition, setSelectedCondition] = useState(""); // Selected condition (e.g., "if hp is")
  const [conditionValue, setConditionValue] = useState(""); // Selected condition (e.g., "if hp is")
  const [comparisonValue, setComparisonValue] = useState(""); // Comparison value for conditions

  const handleActionChange = (event) => {
    setSelectedAction(event.target.value);
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
    console.log("Condition:", selectedCondition);
    console.log("Comparison Value:", comparisonValue);
  };

  return (
    <div className="control-panel-item card">
      <h3>Basic actions</h3>
      <div>
        <label>Condition:</label>
        <select value={selectedCondition} onChange={handleConditionChange}>
          <option value="">None</option>
          <option value="ifHpIs">If my hp is</option>
          <option value="ifTargetHpIs">If target hp is</option>
          <option value="ifTargetLevelIs">If target level is</option>
          <option value="ifTargetNameIs">If target name is</option>
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
              <option value="equal">Equal</option>
              <option value="lower">Lower</option>
              <option value="higher">Higher</option>
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
          <option value="attackEnemy">Attack enemy</option>
          <option value="gatherObject">Gather object</option>
        </select>
      </div>
      <div>
        <button onClick={handleExecuteAction}>Execute Action</button>
      </div>
    </div>
  );
};
