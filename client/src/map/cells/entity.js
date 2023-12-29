import "./player.css";
import { Tooltip } from "react-tooltip";

export const Entity = ({ cell }) => {
  const entity = cell.occupiedBy;
  const backgroundImageUrl = `/images/${entity.kind}.jpg`; // Replace with your image URL

  const calculatePercentage = (current, total) => {
    return (current / total) * 100;
  };

  return (
    <>
      <div
        className={"player-container " + entity.state?.toLowerCase()}
        id={"player-" + entity.id}
        style={{
          backgroundColor: cell.bg,
          height: 40,
          width: 40,
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="player-progress-bar">
          <div
            className="player-progress-bar-hp-fill"
            style={{
              width: `${calculatePercentage(entity.hp, entity.maxHp)}%`,
            }}
          />
        </div>
        {/* You can add additional content or styling if needed */}
      </div>
      <Tooltip anchorSelect={"#player-" + entity.id} place="top">
        <div>
          <span style={{ fontWeight: 800 }}>
            {entity.level} {entity.name}
          </span>
        </div>
        <div style={{ fontSize: 8, fontWeight: 200 }}>Passive</div>
        <div style={{color: 'green'}}>
          Hp {entity.hp}/{entity.maxHp}
        </div>
        <div style={{color: '#007FFF'}}>
          Mana {entity.mana}/{entity.maxMana}
        </div>
      </Tooltip>
    </>
  );
};
