import React, { useState } from "react";
import "./inventory.css";
import { useFetch, useListen } from "../../listen";
import { Item } from "../../item/item";
import { socket } from "../../App";
import { capitalizeFirstLetter } from "../../utils";

export const Inventory = ({ playerId }) => {
  const { data, loading } = useListen("INVENTORY_UPDATED", playerId, true);
  const { data: players } = useFetch("FETCH_PLAYERS");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const equipedItems = data?.inventory?.filter((i) => i.equiped);

  const handleSelectChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const selected = players.find((player) => player.id === selectedId);
    setSelectedPlayer(selected);
  };

  const handOverItems = () => {
    socket.emit("HAND_OVER_ITEMS", {
      playerId,
      toPlayerId: selectedPlayer.id,
      items: selectedItems,
    });
  };

  const handleItemClick = (item) => {
    if (selectedPlayer) {
      setSelectedItems((prev) => [...prev, item.id]);
      return;
    }
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
              className={
                "inventory-item " +
                (item.usable ? "usable " : " ") +
                (selectedPlayer ? "selectable " : " ") +
                (selectedItems.includes(item.id) ? "selected" : "")
              }
              onClick={() => handleItemClick(item)}
            >
              <Item item={item} />
            </div>
          ))}
      </div>
      <div className="hand-over-items">
        <h3>Hand over selected items</h3>
        <select
          value={selectedPlayer?.id || "none"}
          onChange={handleSelectChange}
        >
          <option key={"none"} value={""}>
            None
          </option>
          {players?.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        <button onClick={handOverItems}>Hand over</button>
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
