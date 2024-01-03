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
    <div
      className="map-container"
      onMouseLeave={() => setMapRefreshEnabled(true)}
    >
      {map.map.map((row, rowIndex) => (
        <div key={rowIndex} className="map-row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`map-cell ${cell.type}`}>
              {renderCell(cell, rowIndex)}
            </div>
          ))}
        </div>
      ))}
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
        {cell.occupiedBy && <Entity cell={cell} />}
        {cell.material && <Material cell={cell} />}
        {cell.interactable && <Interactable cell={cell} />}
      </Ground>
    );
  }
};
