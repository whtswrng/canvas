import React, { useEffect, useState } from "react";
import { socket } from "../App";
import "./map.css";
import { Ground } from "./cells/ground";
import { Entity } from "./cells/entity";
import { Material } from "./cells/material";
import { useListen } from "../listen";
import { Interactable } from "./cells/interactable";

export const Map = ({ playerId }) => {
  const { data, loading } = useListen("MAP_UPDATED", playerId);
  const [mapRefreshEnabled, setMapRefreshEnabled] = useState(true);
  const [map, setMap] = useState([]);

  useEffect(() => {
    if (mapRefreshEnabled) setMap(data);
  }, [data]);

  if (loading) return <span>...</span>;

  const handleClick = (cell) => {
    console.log(cell);
    socket.emit("CELL_CLICKED", { playerId, ...cell });
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
            className={`map-cell moving-cell ${p.type}`}
            style={{ marginLeft: p.x * 40.5, marginTop: p.y * 40 }}
          >
            <Entity cell={p.cell} />
          </div>
        ))}
      </>
    );
  }
};
