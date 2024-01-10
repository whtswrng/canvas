import React, { useEffect, useRef, useState } from "react";
import { Attributes } from "./attributes";
import { Map } from "../map/map";
import { useListen } from "../listen";
import { UserActions } from "./user-actions/user-actions";
import { ControlPanel } from "./control-panel/control-panel";
import { Entity } from "../map/cells/entity";
import { Inventory } from "./inventory/inventory";
import { Interaction } from "./interaction/interaction";
import { Effects } from "./effects/effects";
import { MapGenerator } from "./map-generator/map-generator";

export const Character = ({ character: defaultChar }) => {
  const { name } = defaultChar;
  const [state, setState] = useState(null);

  const playerId = defaultChar.playerId;
  const { data: basicAttrsUpdated } = useListen("BASIC_ATTRIBUTES_UPDATED", defaultChar.playerId);
  const { data: _attrs } = useListen("ATTRIBUTES_UPDATED", playerId);
  const { data: interactionData } = useListen("INTERACTION_DATA", playerId);
  const { data: _stateData } = useListen("CHANGE_STATE", playerId);
  const { data: map } = useListen("MAP_UPDATED", playerId);
  const { data: enemyHit } = useListen("ENEMY_HIT", playerId);
  const { data: activePanel } = useListen("ACTIVE_CONTROL_PANEL", playerId);

  const prevInteractionData = usePrevious({ interactionData });

  useEffect(() => {
    if (interactionData && !activePanel?.panelName) {
      if (prevInteractionData.interactionData !== interactionData) {
        setState("interacting");
      }
    }
  }, [interactionData, activePanel]);

  const playerState = _stateData?.state;

  const updatedHp = basicAttrsUpdated?.attrs?.hp;
  const updatedMana = basicAttrsUpdated?.attrs?.mana;

  const hp = updatedHp !== undefined ? updatedHp : defaultChar.hp;
  const maxHp = _attrs?.attrs?.hp || defaultChar.attrs.hp;
  const mana = updatedMana !== undefined ? updatedMana : defaultChar.mana;
  const maxMana = _attrs?.attrs?.mana || defaultChar.attrs.mana;

  const attrs = _attrs?.attrs || defaultChar.attrs;

  const currentTarget = getCurrentTarget();
  const currentCell = getCurrentCell();

  const calculatePercentage = (current, total) => {
    return (current / total) * 100;
  };

  const toggleState = (state) => {
    setState((prev) => {
      if (prev === state) return null;
      return state;
    });
  };

  const close = () => {
    setState("map");
  };

  return (
    <div className="card character-container">
      <div>
        <div className="character-header">
          <div>
            <div>
              <h2 style={{ display: "inline" }}>
                ({attrs.level}) {name}
              </h2>
              <span>
                {" "}
                {currentCell?.x} {currentCell?.y}
              </span>
            </div>
            <span style={{ color: getStateColor() }}>{playerState} </span>
            {activePanel?.panelName && <span style={{ fontWeight: 300 }}>"{activePanel?.panelName}"</span>}
          </div>
          <div className="enemy-container">
            {currentTarget && <Entity cell={{ occupiedBy: currentTarget }} tooltipOpen={true} />}
          </div>
        </div>
        <div className="character-details">
          <div className="basic">
            <p>
              HP {hp}/{maxHp}
            </p>
            <div className="progress-bar">
              <div className="progress-bar-hp-fill" style={{ width: `${calculatePercentage(hp, maxHp)}%` }} />
            </div>
            <p>
              Mana {mana}/{maxMana}
            </p>
            <div className="progress-bar">
              <div className="progress-bar-mana-fill" style={{ width: `${calculatePercentage(mana, maxMana)}%` }} />
            </div>
            <div className="progress-bar" style={{ marginTop: 5, height: 10 }}>
              <div className="progress-bar-exp-fill" style={{ width: `${attrs.levelPercentage}%` }} />
            </div>
          </div>
          <div className="attrs">
            <Attributes attrs={attrs} />
          </div>
        </div>

        <Effects playerId={playerId} />
        <UserActions playerId={playerId} />

        <div className="actions">
          <button className="action" onClick={() => toggleState("panel")}>
            Control panel
          </button>
          <button className="action" onClick={() => toggleState("inventory")}>
            Inventory
          </button>
          <button className="action" onClick={() => toggleState("map")}>
            Map
          </button>
          {/* <button className="action" onClick={toggleMap}>
            Inventory
          </button>
          <button className="action" onClick={toggleMap}>
            Professions
          </button> */}
          {/* Inventory items... */}
        </div>
      </div>
      {state === "map" && (
        <div className="map-container">
          <Map playerId={playerId} />
        </div>
      )}
      {state === "panel" && <ControlPanel playerId={playerId} />}
      {state === "inventory" && <Inventory playerId={playerId} />}
      {state === "interacting" && <Interaction playerId={playerId} data={interactionData} close={close} />}

    </div>
  );

  function getCurrentCell() {
    const cell = findEntityInMap(playerId);
    return cell;
  }

  function findEntityInMap(enemyId) {
    if (!map?.map) return;
    for (const row of map?.map) {
      for (const cell of row) {
        if (cell.occupiedBy?.id === enemyId) {
          return cell;
        }
      }
    }
  }

  function getCurrentTarget() {
    const enemyId = enemyHit?.enemy?.id;
    const enemy = findEntityInMap(enemyId);
    return enemy?.occupiedBy;
  }

  function getStateColor() {
    if (playerState === "IDLE") return "grey";
    if (playerState === "ATTACKING") return "red";
    if (playerState === "GATHERING") return "green";
    if (playerState === "walking") return "white";
  }
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
