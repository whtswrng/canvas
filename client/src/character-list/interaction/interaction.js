import React, { useState } from "react";
import "./interaction.css";
import { Item } from "../../item/item";
import { socket } from "../../App";
import { capitalizeFirstLetter, generateUniqueString } from "../../utils";

export const Interaction = ({ playerId, data: _data, close }) => {
  const data = _data.data;

  return (
    <div className="interaction-container">
      <h3>{data.title}</h3>
      <div className="interaction-description">{data.description}</div>
      {data.action === "pickFromOptions" && <ShopInteraction data={data} playerId={playerId} close={close} />}
      {data.action === "storing" && <StorageInteraction data={data} playerId={playerId} close={close} />}
    </div>
  );
};

const ShopInteraction = ({ playerId, data, close }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAction = () => {
    console.log("EMMITING INTERACTING...");
    socket.emit("INTERACT", {
      reqId: data.reqId,
      playerId,
      data: { optionIndex: selectedOption },
    });
    close();
  };

  return (
    <div>
      <div className="interaction-options">
        {data?.options?.map((option, index) => (
          <div
            key={index}
            className={"interaction-option " + (selectedOption === index ? " selected" : "")}
            onClick={() => setSelectedOption(index)}
          >
            <div className="interaction-option-item">
              <Item item={option.item} />
            </div>
            <div className="interaction-option-separator">requires</div>
            <div className="interaction-option-requirements">
              {option.requirements?.map((r) => {
                if (r.type === "item")
                  return (
                    <div className="interaction-option-item" style={{ opacity: r.fulfilled ? 1 : 0.55 }}>
                      <Item item={r.item} />
                    </div>
                  );
                if (r.type === "secondaryClass")
                  return (
                    <div className="interaction-option-item" style={{ opacity: r.fulfilled ? 1 : 0.55 }}>
                      <Item
                        item={{ name: capitalizeFirstLetter(r.name), level: r.level, id: generateUniqueString() }}
                      />
                    </div>
                  );
                return <span>unknown</span>;
              })}
            </div>
          </div>
        ))}
      </div>
      <div>
        <button onClick={handleAction} disabled={selectedOption === null}>
          {data.actionButton}
        </button>
      </div>
    </div>
  );
};

const StorageInteraction = ({ data, playerId, close }) => {
  const [itemsToStore, setItemsToStore] = useState([]);
  const [itemsToWithdraw, setItemsToWithdraw] = useState([]);

  const handleAction = () => {
    socket.emit("INTERACT", {
      reqId: data.reqId,
      playerId,
      data: { itemsToStore, itemsToWithdraw },
    });
    close();
  };

  const selectStoreOption = (id) => {
    setItemsToStore((prev) => {
      const existingIndex = prev.findIndex((p) => p === id);
      if (existingIndex !== -1) {
        const newList = [...prev];
        newList.splice(existingIndex);
        return newList;
      }
      return [...prev, id];
    });
  };

  const selectWithdrawOption = (id) => {
    setItemsToWithdraw((prev) => {
      const existingIndex = prev.findIndex((p) => p === id);
      if (existingIndex !== -1) {
        const newList = [...prev];
        newList.splice(existingIndex);
        return newList;
      }
      return [...prev, id];
    });
  };

  return (
    <div>
      <h3>Store items</h3>
      <div className="storage-container">
        {data?.inventory?.map((item, index) => (
          <div
            className={"storage-item " + (itemsToStore.includes(item.id) ? " selected" : "")}
            onClick={() => selectStoreOption(item.id)}
          >
            <Item item={item} />
          </div>
        ))}
      </div>
      <h3>Withdraw items</h3>
      <div className="storage-container">
        {data?.storedItems?.map((item, index) => (
          <div
            className={"storage-item " + (itemsToWithdraw.includes(item.id) ? " selected" : "")}
            onClick={() => selectWithdrawOption(item.id)}
          >
            <Item item={item} />
          </div>
        ))}
      </div>
      <div>
        <button onClick={handleAction} disabled={itemsToStore.length === 0 && itemsToWithdraw.length === 0}>
          {data.actionButton}
        </button>
      </div>
    </div>
  );
};
