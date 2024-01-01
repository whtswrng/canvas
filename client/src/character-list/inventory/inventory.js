import React from "react";
import "./inventory.css";
import { useListen } from "../../listen";
import { Item } from "../../item/item";

export const Inventory = ({ playerId }) => {
  const {data, loading} = useListen("INVENTORY_UPDATED", playerId, true);

  if(loading) return <span>...</span>

  return (
    <div className="inventory">
      <h3>Inventory</h3>
      <div className="inventory-grid">
        {data?.inventory.map((item) => (
          <div key={item.id} className="inventory-item">
            <Item item={item}/>
          </div>
        ))}
      </div>
    </div>
  );
};
