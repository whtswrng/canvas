import React from "react";
import "./inventory.css";
import { useListen } from "../../listen";
import { Item } from "../../item/item";
import { socket } from "../../App";
import { capitalizeFirstLetter } from "../../utils";

export const Inventory = ({ playerId }) => {
  const { data, loading } = useListen("INVENTORY_UPDATED", playerId, true);

  const equipedItems = data?.inventory?.filter((i) => i.equiped);

  const handleItemClick = (item) => {
    if (!item) return;
    if (item.usable) {
      socket.emit("USE_ITEM", { playerId, itemId: item.id });
    } else {
      socket.emit("EQUIP_ITEM", { playerId, itemId: item.id });
    }
  };

  if (loading) return <span>...</span>;

  return (
    <div className="inventory">
      <h3>Equiped items</h3>
      <div className="inventory-grid">
        {renderEquiped("weapon")}
        {renderEquiped("secondary")}
        <div></div>
        {renderEquiped("head")}
        {renderEquiped("armor")}
        {renderEquiped("hands")}
        {renderEquiped("boots")}
      </div>
      <h3>Inventory</h3>
      <div className="inventory-grid">
        {data?.inventory
          ?.filter((i) => !i.equiped)
          .map((item) => (
            <div
              key={item.id}
              className={"inventory-item " + (item.usable ? "usable" : "")}
              onClick={() => handleItemClick(item)}
            >
              <Item item={item} />
            </div>
          ))}
      </div>
    </div>
  );

  function renderEquiped(type) {
    const item = equipedItems?.find((i) => i.type === type);

    return (
      <div>
        <span>{capitalizeFirstLetter(type)}</span>
        <div
          key={item?.id}
          className={"inventory-item equipable " + (!item ? "empty" : "")}
          onClick={() => handleItemClick(item)}
        >
          {item && <Item item={item} />}
        </div>
      </div>
    );
  }
};
