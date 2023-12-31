import React, { useState } from "react";
import { useControls } from "./controls-context";

const Control = ({
  type,
  conditionOptions,
  conditionValueOptions,
  actionTypes,
  title,
  valueOptions,
  valueOption,
}) => {
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [conditionValue, setConditionValue] = useState("");
  const [comparisonValue, setComparisonValue] = useState("");

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

  const handleExecuteAction = () => {
    const actionPayload = {
      type,
      actionType: selectedAction,
      actionValue: selectedValue,
      condition: selectedCondition,
      conditionValue,
      conditionComparisonValue: comparisonValue ? comparisonValue + getFormat(selectedCondition) : '',
    };

    save(actionPayload);
  };

  const handleRemoveAction = (actionToRemove) => {
    remove(actionToRemove);
  };

  function getFormat(condition) {
    const o = conditionOptions.find((c) => c.value === condition);
    if (o && o.format !== undefined) return o.format;
    return "%";
  }

  const ActionRow = ({ action, handleRemoveAction, conditionOptions }) => {
    return (
      <div key={action.id} className="action-row">
        {optionalRender(action.condition, { marginLeft: 0 })}
        {optionalRender(action.conditionValue)}
        {optionalRender(action.conditionComparisonValue)}
        {optionalRender(action.actionType)}
        {optionalRender(action.actionValue, { fontWeight: "bold" })}
        <span
          style={{ fontWeight: "bold", cursor: "pointer", marginLeft: 10 }}
          onClick={() => handleRemoveAction(action)}
        >
          x
        </span>
      </div>
    );

    function optionalRender(value, styles = {}, suffix) {
      return value ? (
        <span style={{ ...styles }}>
          {value}
          {suffix}
        </span>
      ) : null;
    }
  };

  return (
    <div className="control-panel-item card">
      <h3>{title ?? type}</h3>
      <div>
        <label>Condition:</label>
        <select value={selectedCondition} onChange={handleConditionChange}>
          <option value="">None</option>
          {conditionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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
              {conditionValueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
          {actionTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {valueOptions && (
        <div>
          <label>Value:</label>
          <select value={selectedValue} onChange={handleValueChange}>
            <option value="">Select Value</option>
            {valueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {valueOption && (
        <div>
          <label>Value:</label>
          <input
            type="text"
            value={selectedValue}
            onChange={handleValueChange}
          />
        </div>
      )}
      <div>
        <button onClick={handleExecuteAction}>Create action</button>
      </div>
      <div className="action-list">
        {list.map((action, index) => (
          <ActionRow
            key={index}
            action={action}
            handleRemoveAction={handleRemoveAction}
            conditionOptions={conditionOptions}
          />
        ))}
      </div>
    </div>
  );
};

export default Control;
