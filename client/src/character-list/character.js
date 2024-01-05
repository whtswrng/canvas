import React, { useEffect, useState } from "react";
import { Attributes } from "./attributes";
import { Map } from "../map/map";
import { useListen } from "../listen";
import { UserActions } from "./user-actions/user-actions";
import { ControlPanel } from "./control-panel/control-panel";
import { Entity } from "../map/cells/entity";
import { Inventory } from "./inventory/inventory";
import { Interaction } from "./interaction/interaction";
import { Effects } from "./effects/effects";

export const Character = ({ character: defaultChar }) => {
  const { name } = defaultChar;
  const [state, setState] = useState(null);

  const playerId = defaultChar.playerId;
  const { data: basicAttrsUpdated } = useListen(
    "BASIC_ATTRIBUTES_UPDATED",
    defaultChar.playerId
  );
  const { data: _attrs } = useListen("ATTRIBUTES_UPDATED", playerId);
  const { data: interactionData } = useListen("INTERACTION_DATA", playerId);
  const { data: _stateData } = useListen("CHANGE_STATE", playerId);
  const { data: map } = useListen("MAP_UPDATED", playerId);
  const { data: enemyHit } = useListen("ENEMY_HIT", playerId);

  useEffect(() => {}, [_stateData]);

  useEffect(() => {
    if (interactionData) {
      setState("interacting");
    }
  }, [interactionData]);

  const playerState = _stateData?.state;

  const updatedHp = basicAttrsUpdated?.attrs?.hp;
  const updatedMana = basicAttrsUpdated?.attrs?.mana;

  const hp = updatedHp !== undefined ? updatedHp : defaultChar.hp;
  const maxHp = _attrs?.attrs?.hp || defaultChar.attrs.hp;
  const mana = updatedMana !== undefined ? updatedMana : defaultChar.mana;
  const maxMana = _attrs?.attrs?.mana || defaultChar.attrs.mana;

  const attrs = _attrs?.attrs || defaultChar.attrs;

  const currentTarget = getCurrentTarget();

  const calculatePercentage = (current, total) => {
    return (current / total) * 100;
  };

  const toggleState = (state) => {
    setState((prev) => {
      if (prev === state) return null;
      return state;
    });
  };

  return (
    <div className="card character-container">
      <div>
        <div className="character-header">
          <div>
            <h2>
              {name} {attrs.level} {attrs.levelPercentage}{" "}
            </h2>
            <span style={{ color: getStateColor() }}>{playerState}</span>
          </div>
          <div className="enemy-container">
            {currentTarget && (
              <Entity cell={{ occupiedBy: currentTarget }} tooltipOpen={true} />
            )}
          </div>
        </div>
        <div className="character-details">
          <div className="basic">
            <p>
              HP {hp}/{maxHp}
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-hp-fill"
                style={{ width: `${calculatePercentage(hp, maxHp)}%` }}
              />
            </div>
            <p>
              Mana {mana}/{maxMana}
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-mana-fill"
                style={{ width: `${calculatePercentage(mana, maxMana)}%` }}
              />
            </div>
            <div className="progress-bar" style={{ marginTop: 5, height: 10 }}>
              <div
                className="progress-bar-exp-fill"
                style={{ width: `${attrs.levelPercentage}%` }}
              />
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
      {state === "interacting" && (
        <Interaction playerId={playerId} data={interactionData} />
      )}
    </div>
  );

  function getCurrentTarget() {
    const enemyId = enemyHit?.enemy?.id;
    const enemy = findEntityInMap();

    return enemy;

    function findEntityInMap() {
      if (!map?.map) return;
      for (const row of map?.map) {
        for (const cell of row) {
          if (cell.occupiedBy?.id === enemyId) {
            return cell.occupiedBy;
          }
        }
      }
    }
  }

  function getStateColor() {
    if (playerState === "IDLE") return "grey";
    if (playerState === "ATTACKING") return "red";
    if (playerState === "GATHERING") return "green";
    if (playerState === "walking") return "white";
  }
};
