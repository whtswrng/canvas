import React, { useState } from "react";
import "./interaction.css";
import { Item } from "../../item/item";
import { socket } from "../../App";

export const Interaction = ({ playerId, data: _data }) => {
  const data = _data.data;

  const [selectedOption, setSelectedOption] = useState(null);

  const handleAction = () => {
    socket.emit("INTERACT", {
      reqId: data.reqId,
      playerId,
      data: { optionIndex: selectedOption },
    });
  };

  return (
    <div className="interaction-container">
      <h3>{data.title}</h3>
      <div className="interaction-description">{data.description}</div>
      <div className="interaction-options">
        {data?.options?.map((option, index) => (
          <div
            key={index}
            className={
              "interaction-option " +
              (selectedOption === index ? " selected" : "")
            }
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
                    <div className="interaction-option-item" style={{opacity: r.fulfilled ? 1 : 0.55}}>
                      <Item item={r.item} />
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
