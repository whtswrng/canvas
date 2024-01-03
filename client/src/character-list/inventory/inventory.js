import React from "react";
import "./inventory.css";
import { useListen } from "../../listen";
import { Item } from "../../item/item";
import { socket } from "../../App";

export const Inventory = ({ playerId }) => {
  const { data, loading } = useListen("INVENTORY_UPDATED", playerId, true);

  const handleItemClick = (itemId) => {
    socket.emit("USE_ITEM", { playerId, itemId });
  };

  if (loading) return <span>...</span>;

  return (
    <div className="inventory">
      <h3>Inventory</h3>
      <div className="inventory-grid">
        {data?.inventory.map((item) => (
          <div
            key={item.id}
            className={"inventory-item " + (item.usable ? "usable" : "")}
            onClick={() => handleItemClick(item.id)}
          >
            <Item item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
