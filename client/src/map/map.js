import React, { useEffect, useState } from "react";
import { socket } from "../App";
import "./map.css";
import { Ground } from "./cells/ground";
import { Entity } from "./cells/entity";
import { Material } from "./cells/material";
import { useListen } from "../listen";
import { Interactable } from "./cells/interactable";
import { MapGenerator } from "../character-list/map-generator/map-generator";

const cache = {};

export const Map = ({ playerId }) => {
  const { data, loading } = useListen("MAP_UPDATED", playerId);
  const [mapRefreshEnabled, setMapRefreshEnabled] = useState(true);
  const [map, setMap] = useState([]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    if (mapRefreshEnabled) setMap(data);
  }, [data]);

  if (loading) return <span>...</span>;

  const handleClick = (cell) => {
    if (editing) {
      console.log(editing, name, color, isStatic, cell);
      socket.emit("PAINT_CELL", { x: cell.x, y: cell.y, name, color, isStatic });
    } else {
      socket.emit("CELL_CLICKED", { playerId, ...cell });
    }
  };

  return (
    <div className="map-container" onMouseLeave={() => setMapRefreshEnabled(true)}>
      {map.map.map((row, rowIndex) => (
        <div key={rowIndex} className="map-row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`map-cell ${cell.type}`}>
              {renderCell(cell, rowIndex)}
            </div>
          ))}
        </div>
      ))}
      {renderPlayers(map)}
    </div>
  );

  function renderCell(cell) {
    return (
      <Ground
        cell={cell}
        onMouseDown={() => setMapRefreshEnabled(false)}
        onMouseEnter={() => (editing && !mapRefreshEnabled) ? handleClick(cell) : null}
        onMouseUp={() => {
          setMapRefreshEnabled(true);
          handleClick(cell);
        }}
      >
        {cell.material && <Material cell={cell} />}
        {cell.interactable && <Interactable cell={cell} />}
      </Ground>
    );
  }

  function renderPlayers(map) {
    const playerCells = [];
    for (let y = 0; y < map.map.length; y++) {
      for (let x = 0; x < map.map[y].length; x++) {
        const cell = map.map[y][x];
        if (cell.occupiedBy) playerCells.push({ cell, y, x });
      }
    }

    return (
      <>
        {playerCells.map((p) => (
          <div
            onMouseUp={() => {
              setMapRefreshEnabled(true);
              handleClick(p.cell);
            }}
            key={p.cell.occupiedBy.id}
            className={`map-cell moving-cell ${getMovingClass(p)} ${p.type}`}
            style={{ marginLeft: p.x * 40.5, marginTop: p.y * 40 }}
          >
            <Entity cell={p.cell} />
          </div>
        ))}

        <MapGenerator
          editing={editing}
          onClick={() => setEditing((prev) => !prev)}
          setColor={setColor}
          setName={setName}
          setStatic={setIsStatic}
        />
      </>
    );

    function getMovingClass(p) {
      const id = p.cell.occupiedBy.id;
      if (!id) return "";
      if (cache[id] === "blocked") return; // need to block the player so browser actually rerenders
      if (!cache[id]) cache[id] = { x: p.x, y: p.y };

      const oldX = cache[id].x;
      const oldY = cache[id].y;

      if (Math.abs(oldX - p.x) > 2 || Math.abs(oldY - p.y) > 2) {
        cache[id] = "blocked";
        setTimeout(() => {
          cache[id] = { x: p.x, y: p.y };
        }, 0);
        return "";
      }

      cache[id] = { x: p.x, y: p.y };
      return "moving";
    }
  }
};
