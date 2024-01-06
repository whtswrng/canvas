import React, { memo, useMemo, useState } from "react";
import Control from "./control";
import "./control-panel.css";
import { useFetch, useListen } from "../../listen";
import { ControlsProvider, useControls } from "./controls-context";
import { socket } from "../../App";

export const ControlPanel = memo(({ playerId }) => {
  const { data: _data, loading } = useFetch("FETCH_CONTROL_PANEL");
  const { data: panelData } = useListen("CONTROL_PANEL_UPDATED");
  const { changeTo, panelName: currentPanelName } = useControls();

  const data = panelData?.panel ?? _data?.panel;

  function handleControlPanelChange(event) {
    const val = event.target.value;
    changeTo(val);
  }

  function addNewControlPanel() {
    const name = window.prompt("Name of the panel");
    socket.emit("ADD_CONTROL_PANEL", { name });
  }

  function renameControlPanel() {
    const name = window.prompt("New name", currentPanelName);
    socket.emit("RENAME_CONTROL_PANEL", { old: currentPanelName, new: name });
  }

  function deleteControlPanel() {
    socket.emit("DELETE_CONTROL_PANEL", { name: currentPanelName });
  }

  function getControls(type) {
    const panel = data?.find((p) => p.name === currentPanelName);
    return panel?.controls.filter((e) => e.type === type) ?? [];
  }

  function createControl(payload) {
    const panel = data?.find((p) => p.name === currentPanelName);
    if (!panel) return;

    const newControls = [...panel?.controls, payload];
    socket.emit("UPDATE_CONTROLS", { playerId, controls: newControls, name: currentPanelName });
  }

  function removeAction(controlType, action) {
    const panel = data?.find((p) => p.name === currentPanelName);
    if (!panel) return;

    console.log("here", action);
    const controls = panel.controls.filter((c) => c !== action);
    console.log(controls);
    socket.emit("UPDATE_CONTROLS", { playerId, controls, name: currentPanelName });
  }

  return (
    <div className="control-panel">
      {data && (
        <div style={{ marginTop: 10 }}>
          <select value={currentPanelName} onChange={handleControlPanelChange}>
            <option value="">None</option>
            {data?.map((option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
          <button style={{ marginLeft: 5, marginRight: 5 }} onClick={addNewControlPanel}>
            New
          </button>
          <button onClick={renameControlPanel}>Rename</button>
          <button onClick={deleteControlPanel}>Delete</button>
        </div>
      )}

      <Control
        list={getControls("combat")}
        createControl={createControl}
        removeAction={removeAction}
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
        list={getControls("pathing")}
        createControl={createControl}
        removeAction={removeAction}
        conditionOptions={[
          { value: "ifHp", label: "If my hp is" },
          { value: "ifMana", label: "If my mana is" },
          { value: "ifTargetHp", label: "If target hp is" },
          { value: "ifTargetLvl", label: "If target hp is" },
          { value: "ifTargetName", label: "If target name is" },
          { value: "ifMyPosition", label: "If my position is" },
        ]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[
          { value: "goToPosition", label: "Go to position" },
          { value: "followPlayer", label: "Follow player" },
        ]}
        valueOption={true}
      />
      <Control
        playerId={playerId}
        title="Basic actions"
        list={getControls("basic")}
        createControl={createControl}
        removeAction={removeAction}
        type="basic"
        conditionOptions={[
          { value: "ifHp", label: "If my hp is" },
          { value: "ifMana", label: "If my mana is" },
          { value: "ifTargetHp", label: "If target hp is" },
          { value: "ifTargetLvl", label: "If target lvl is" },
          { value: "ifTargetName", label: "If target name is" },
          { value: "ifMyPosition", label: "If my position is" },
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
          { value: "getItem", label: "Get item" },
          { value: "storeItem", label: "Store item" },
          { value: "playAlarm", label: "Play alarm" },
        ]}
        valueOption={true}
      />
      <Control
        playerId={playerId}
        title="Transition to panel"
        list={getControls("transition")}
        createControl={createControl}
        removeAction={removeAction}
        type="transition"
        conditionOptions={[
          { value: "ifHp", label: "If my hp is" },
          { value: "ifMana", label: "If my mana is" },
          { value: "ifTargetHp", label: "If target hp is" },
          { value: "ifTargetLvl", label: "If target lvl is" },
          { value: "ifTargetName", label: "If target name is" },
          { value: "ifMyPosition", label: "If my position is" },
          { value: "ifItemInInventory", label: "If item in my inventory" },
        ]}
        conditionValueOptions={[
          { value: "isEqual", label: "Equal" },
          { value: "isLowerThan", label: "Lower" },
          { value: "isHigherThan", label: "Higher" },
        ]}
        actionTypes={[{ value: "transitionTo", label: "Transition to" }]}
        valueOptions={data?.map((p) => ({ value: p.name, label: p.name }))}
      />
    </div>
  );
});
