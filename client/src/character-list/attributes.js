import React from 'react';

export const Attributes = ({ attrs }) => {
  return (
    <div className="attributes-container">
      <div className="attribute">
        <div className="attribute-name">HP:</div>
        <div className="attribute-value">{attrs.hp}</div>
      </div>
      <div className="attribute">
        <div className="attribute-name">Mana:</div>
        <div className="attribute-value">{attrs.mana}</div>
      </div>
      <div className="attribute">
        <div className="attribute-name">Power:</div>
        <div className="attribute-value">{attrs.power}</div>
      </div>
      <div className="attribute">
        <div className="attribute-name">Defense:</div>
        <div className="attribute-value">{attrs.defense}</div>
      </div>
      <div className="attribute">
        <div className="attribute-name">Critical Chance:</div>
        <div className="attribute-value">{attrs.critChance}%</div>
      </div>
    </div>
  );
};
