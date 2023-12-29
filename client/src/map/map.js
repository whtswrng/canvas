import React, { useEffect, useState } from "react";
import { socket } from "../App";
import "./map.css";
import { Ground } from "./cells/ground";
import { Entity } from "./cells/entity";
import { Material } from "./cells/material";
import { useListen } from "../listen";

export const Map = ({ playerId }) => {
  const { data, loading } = useListen("MAP_UPDATED", playerId);

  if(loading) return <span>...</span>

  return (
    <div className="map-container">
      {data.map.map((row, rowIndex) => (
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
      <Ground cell={cell}>
        {cell.occupiedBy && <Entity cell={cell} />}
        {cell.material && <Material cell={cell} />}
      </Ground>
    );
  }
};
